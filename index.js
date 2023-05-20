import weaviate from 'weaviate-ts-client';
import { readdirSync } from 'node:fs';

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080'
});

const schemeRes = await client.schema.getter().do();

console.log(schemeRes);

const schemaConfig = {
  class: 'Meme',
  vectorizer: 'img2vec-neural',
  vectorIndexType: 'hnsw',
  moduleConfig: {
    'img2vec-neural': {
      imageFields: ['image']
    }
  },
  properties: [
    {
      name: 'image',
      dataType: ['blob']
    },
    {
      name: 'text',
      dataType: ['string']
    }
  ]
};

// await client.schema.classCreator().withClass(schemaConfig).do();

// const img = readFileSync('./img/meme1.jpg');
// const b64 = Buffer.from(img).toString('base64');
// const res = await client.data
//   .creator()
//   .withClassName('Meme')
//   .withProperties({
//     image: b64,
//     text: 'meme1'
//   })
//   .do();

const imgFiles = readdirSync('./img');
const promises = imgFiles.map(async (imgFile) => {
  console.log(`Loading file: ${imgFile}`);
  const b64 = Buffer.from(imgFile).toString('base64');
  await client.data
    .creator()
    .withClassName('Meme')
    .withProperties({
      image: b64,
      text: imgFile.split('.')[0].split('_').join(' ')
    })
    .do();
});

await Promise.all(promises);

const test = Buffer.from(readFileSync('./testimg.jpg')).toSring('base64');

const resImage = await client.graphql
  .get()
  .withClassName('Meme')
  .withFields(['image'])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

const result = resImage.data.Get.Meme[0].image;

writeFileSync('./result.jpg', result);
