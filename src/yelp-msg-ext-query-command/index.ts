import { Context, HttpMethod, HttpRequest, HttpResponse, HttpStatusCode } from 'azure-functions-ts-essentials';
import * as botbuilder from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import { HttpRequestWrapper } from './httpRequestWrapper';
import { onQuery } from './onQuery';

export function run(context: Context, req: HttpRequest): any {
  const teamChatConnector = new teamBuilder.TeamsChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
  });

  teamChatConnector.onQuery('getYelpResults',
  (event: botbuilder.IEvent,
   query: teamBuilder.ComposeExtensionQuery,
   callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void) => {
      onQuery(context, query, callback);
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
