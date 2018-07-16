import { Context } from 'azure-functions-ts-essentials';
import * as botbuilder from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import * as request from 'request';

const azureMapBaseUrl = 'https://atlas.microsoft.com';

export function onLocationQuery(
    context: Context,
    query: teamBuilder.ComposeExtensionQuery,
    callback: (err: Error, result: teamBuilder.IComposeExtensionResponse, statusCode: number) => void): void {
    const address = query.parameters && query.parameters[0].name === 'locQuery'
    ? query.parameters[0].value : '';

    // call Azure Map search API to search address
    const azureMapSearchUrl = `${azureMapBaseUrl}/search/address/json?subscription-key=${process.env.AZURE_MAP_SUBSCRIPTION_KEY}&api-version=1.0&query=${address}`;

    request(azureMapSearchUrl, { json: true }, (err, res, body) => {
        if (err) return context.log(err);
        const attachments: Array<teamBuilder.ComposeExtensionAttachment> = [];

        body.results.forEach(result => {
            const azureMapImageUrl = `${azureMapBaseUrl}/map/static/png?subscription-key=${process.env.AZURE_MAP_SUBSCRIPTION_KEY}&api-version=1.0&layer=basic&style=main&zoom=11&center=${result.position.lon},${result.position.lat}`;
            const card = new botbuilder.HeroCard()
            .title(result.address.freeformAddress)
            .images([new botbuilder.CardImage().url(azureMapImageUrl)]);

            const previewCard = new botbuilder.HeroCard()
            .title(result.address.freeformAddress)
            .images([new botbuilder.CardImage().url(azureMapImageUrl)])
            .tap(new botbuilder.CardAction()
            .type('invoke')
            .value({
                location: {
                    lon: result.position.lon,
                    lat: result.position.lat
                }
            } as any));
            const cardAttachment: teamBuilder.ComposeExtensionAttachment = card.toAttachment();
            cardAttachment.preview = previewCard.toAttachment();
            attachments.push(card.toAttachment());
        });
        const composeExtensionRes = teamBuilder.ComposeExtensionResponse.result('list')
        .attachments(attachments)
        .toResponse();
        callback(undefined, composeExtensionRes, 200);
      });
    }
