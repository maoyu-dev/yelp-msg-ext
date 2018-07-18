import { Context } from 'azure-functions-ts-essentials';
import * as botbuilder from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import * as yelp from 'yelp-fusion';
import * as azure from 'azure-storage';

function getPreviewCard(place: any): botbuilder.ThumbnailCard {
  let addressString = '';
  place.location.display_address.forEach(address => {
    addressString += `${address} `;
  });

  return new botbuilder.HeroCard()
  .title(place.name)
  .text(`${addressString} <br> Rating: ${place.rating}`)
  .images([ new botbuilder.CardImage().url(place.image_url) ]);
}

export function onSearchQuery(
  context: Context,
  query: teamBuilder.ComposeExtensionQuery,
  callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void): void {
  const tableSvc = azure.createTableService(process.env.STORAGE_ACCOUNT, process.env.STORAGE_KEY);
  const userId = context.req.body.address && context.req.body.address.user ? context.req.body.address.user.id : undefined;
  const isInitialRun = query.parameters.length === 1 && query.parameters[0].name === 'initialRun';

  // get user default location
  tableSvc.retrieveEntity('yelpDefaultLocation', 'yelpDefaultLocation', userId, (error, result: any, tableResponse) => {
    if (error || !result)
      callback(undefined, teamBuilder.ComposeExtensionResponse
        .message()
        .text('Please use the Set location command to set default search location')
        .toResponse(), 200);
    else {
      const location = JSON.parse(result.location._);

      if (isInitialRun)
        callback(undefined, teamBuilder.ComposeExtensionResponse
          .message()
          .text(`Searching near ${location.friendlyName}`)
          .toResponse(), 200);
      else {
        const limit = 25;
        const apiKey = process.env.YELP_API_KEY;
        const title = query.parameters && query.parameters[0].name === 'bizQuery'
        ? query.parameters[0].value
        : '';
        const searchRequest = {
          term: title,
          latitude: location.lat,
          longitude: location.lon,
          limit
        };
        const client = yelp.client(apiKey);
        client.search(searchRequest)
        .then(response => {
          const attachments: Array<teamBuilder.ComposeExtensionAttachment> = [];
          response.jsonBody.businesses.forEach(place => {
            const previewCard = getPreviewCard(place);
            const cardAttachment = getPreviewCard(place)
              .buttons([ new botbuilder.CardAction()
                .type('openUrl')
                .value(place.url)
                .title('View listing')])
              .toAttachment();
            (cardAttachment as teamBuilder.ComposeExtensionAttachment).preview = previewCard.toAttachment();
            attachments.push(cardAttachment);
          });
          const composeExtensionRes = teamBuilder.ComposeExtensionResponse.result('list')
            .attachments(attachments)
            .toResponse();
          callback(undefined, composeExtensionRes, 200);
        })
        .catch(e => {
          context.log(`Error process query command: ${JSON.stringify(e)}`);
          throw e;
        });
      }
    }
  });
}
