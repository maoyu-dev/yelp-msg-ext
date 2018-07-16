import { Context, HttpMethod, HttpRequest, HttpResponse, HttpStatusCode } from 'azure-functions-ts-essentials';
import * as botbuilder from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import * as azure from 'azure-storage';

export function onSelectItem(
  context: Context,
  query: teamBuilder.ComposeExtensionQuery,
  callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void): void {

  const tableSvc = azure.createTableService(process.env.STORAGE_ACCOUNT, process.env.STORAGE_KEY);
  const userId = context.req.body.address && context.req.body.address.user ? context.req.body.address.user.id : undefined;
  const location = JSON.stringify((query as any).location);
  const entGen = azure.TableUtilities.entityGenerator;

  // update user default location
  tableSvc.insertOrReplaceEntity('yelpDefaultLocation', {
    PartitionKey: entGen.String('yelpDefaultLocation'),
    RowKey: entGen.String(userId),
    location: entGen.String(location)
  }, (error, result, response) => {
    if (error) {
      context.log(`Saving default locationfailed: ${JSON.stringify(error)}`);
      callback(error, undefined, 500);
    } else
      callback(undefined, {}, 200);
  });
}
