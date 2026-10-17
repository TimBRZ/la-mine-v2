import {LocalLeaderboardStore} from './local-store.js';
import {LeaderboardService} from './service.js';
import {leaderboardConfig} from './config.js';
import {RemoteAPI} from './remote-api.js';
import {RemoteLeaderboardStore} from './remote-store.js';
import {mockFetch} from './mock-api.js';
export function createLeaderboardService({storage,href=globalThis.location?.href}={}){
 const config=leaderboardConfig(href);
 const remoteStore=config.mode==='remote'?new RemoteLeaderboardStore(new RemoteAPI({...config,...(config.mock?{fetchImpl:mockFetch(config.scenario)}:{})}),{mock:config.mock}):null;
 return new LeaderboardService(new LocalLeaderboardStore(storage),{remoteStore});
}
