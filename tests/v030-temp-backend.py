"""Explicit TEMP-only backend on 127.0.0.1:5186. No real server, secrets or lifespan."""
from pathlib import Path
from contextlib import closing
import hashlib
import json
import os
import sqlite3
import sys
import tempfile
from urllib.parse import urlsplit
from urllib.request import url2pathname
from unittest.mock import patch

ROOT=Path(r'C:\Users\Tim Pro\Documents\Sauvegarde CGWEB\CGWeb_BASE_VALIDEE_PHASE6G_02-09-2026\CoupDeGrisouWeb')
MINE=Path(__file__).resolve().parent.parent
fixture=tempfile.TemporaryDirectory(prefix='lamine-v030-backend-')
target=Path(fixture.name)/'leaderboard-test.db'
assert target.parent.resolve().is_relative_to(Path(tempfile.gettempdir()).resolve())
def audit(event,args):
    if event=='sqlite3.connect':
        raw=str(args[0]);path=Path(url2pathname(urlsplit(raw).path)) if raw.startswith('file:') else Path(raw)
        if path.resolve()!=target.resolve():raise AssertionError('Only this TEMP fixture may be opened')
sys.addaudithook(audit)
sys.path.insert(0,str(ROOT/'backend'))
from app import database as db
db.DB_PATH=target
with patch.dict(os.environ,{'DISCORD_BOT_TOKEN':'fixture-only','PLAYER_SESSION_COOKIE_SECURE':'0'}),patch('dotenv.load_dotenv',return_value=False):
    from app import main as api
    from app.mine_leaderboard import initialize_test_schema
    from fastapi import Request
    from fastapi.responses import JSONResponse
    import uvicorn
    api.TRUSTED_WRITE_ORIGINS={'http://127.0.0.1:5185'}
    tokens={key:'synthetic-temp-session-'+key for key in ('a','b')}
    with closing(sqlite3.connect(target)) as con:
        con.executescript('''CREATE TABLE player_accounts(player_id TEXT PRIMARY KEY,display_name TEXT,account_status TEXT);
            CREATE TABLE player_sessions(id INTEGER PRIMARY KEY,player_id TEXT,session_token_hash TEXT,expires_at TEXT,revoked_at TEXT,last_seen_at TEXT);''')
        for key,name in [('a','TIM TEMP'),('b','ALICE TEMP')]:
            con.execute('INSERT INTO player_accounts VALUES(?,?,?)',('temp-'+key,name,'active'))
            con.execute('INSERT INTO player_sessions(player_id,session_token_hash,expires_at,last_seen_at) VALUES(?,?,?,?)',
                        ('temp-'+key,hashlib.sha256(tokens[key].encode()).hexdigest(),'2999-01-01T00:00:00+00:00','unchanged'))
        con.commit()
    initialize_test_schema(target)
    @api.app.post('/__test__/session/{actor}')
    def session(actor:str,request:Request):
        if request.headers.get('origin')!='http://127.0.0.1:5185':return JSONResponse({'detail':'Forbidden'},status_code=403)
        if actor not in ('a','b','none','invalid'):return JSONResponse({'detail':'Unknown'},status_code=404)
        response=JSONResponse({'test_actor':actor},headers={'Cache-Control':'no-store'})
        if actor=='none':response.delete_cookie(api.PLAYER_SESSION_COOKIE,path='/')
        else:api._set_player_session_cookie(response,tokens.get(actor,'synthetic-invalid-session'))
        return response
    print('TEMP backend ready: 127.0.0.1:5186; SQLite fixture only; lifespan OFF',flush=True)
    try:uvicorn.run(api.app,host='127.0.0.1',port=5186,lifespan='off',access_log=False,log_level='warning')
    finally:
        with closing(sqlite3.connect(target.as_uri()+'?mode=ro',uri=True)) as con:
            report={'temp_only':True,'records':con.execute('SELECT count(*) FROM mine_player_records').fetchone()[0],
                    'weekly':con.execute('SELECT count(*) FROM mine_weekly_records').fetchone()[0],
                    'sessions_untouched':con.execute("SELECT count(*) FROM player_sessions WHERE last_seen_at!='unchanged'").fetchone()[0]==0}
        (MINE/'tests/v030-temp-db-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
fixture.cleanup()
