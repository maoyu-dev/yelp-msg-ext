import { Context, HttpMethod, HttpRequest, HttpResponse, HttpStatusCode } from 'azure-functions-ts-essentials';
import * as botbuilder from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import { HttpRequestWrapper } from './httpRequestWrapper';
import { onSearchQuery } from './onSearchQuery';
import { onLocationQuery } from './onLocationQuery';
import { onSelectItem } from './onSelectItem';

export function run(context: Context, req: HttpRequest): any {
  const teamChatConnector = new teamBuilder.TeamsChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
  });

  teamChatConnector.onQuery('getYelpResults',
  (event: botbuilder.IEvent,
   query: teamBuilder.ComposeExtensionQuery,
   callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void) => {
    onSearchQuery(context, query, callback);
  });

  teamChatConnector.onQuery('setDefaultLocation',
  (event: botbuilder.IEvent,
   query: teamBuilder.ComposeExtensionQuery,
   callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void) => {
    onLocationQuery(context, query, callback);
  });

  teamChatConnector.onSelectItem(
    (event: botbuilder.IEvent,
     query: teamBuilder.ComposeExtensionQuery,
     callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void) => {
     onSelectItem(context, query, callback);
  });

  const res: HttpRequestWrapper = new HttpRequestWrapper();
  const processReq: any = teamChatConnector.listen();
  processReq(req, res, () => {
      context.res = {
          status: res.statusCode,
          body: res.body
      };
      context.done();
  });
}
