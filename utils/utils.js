import { 
  ApolloClient, 
  ApolloLink,
  HttpLink,
  InMemoryCache,
  gql 
} from "@apollo/client";
import { Blob, File, Web3Storage } from "web3.storage";

export const LENS_HUB_CONTRACT_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

const API = `https://api.lens.dev`;

const httpLink = new HttpLink({ uri: API });

const authLink = new ApolloLink((operation, forward) => {
  const token = sessionStorage.getItem('accessToken');

  operation.setContext({
      headers: {
          'x-access-token': token ? `Bearer ${token}` : '',
      },
  });

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

// Create a web3.storage client
const MakeStorageClient = () => {
  return new Web3Storage({token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEJFQjlmMDg4MzJjMjZlNzM2YzhGMTc2NzBENUY0QzAxYWRkNmU0ODIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjA4MTUwNzM5MjAsIm5hbWUiOiJmYXQtdHViYnlzIn0.TKf5_0rQD_dKZcHWdZp_8W3kYGg1pjC7vPf9hT_DU70"})
}

// Send data to IPFS
export const sendToIpfs = async (files) => {
  const client = MakeStorageClient()
  const file =[new File([files], {type: 'application/json'})]
  const cid = await client.put(file, {
    wrapWithDirectory: false,
  })
  console.log(`File stored with CID: ${cid}`)
  return cid
}

export const sendImageToIpfs = async (files) => {
  const client = MakeStorageClient()
  const cid = await client.put([files], {
    wrapWithDirectory: false,
  })
  console.log(`File stored with CID: ${cid}`)
  return cid
}

export const baseMetadata = {
  version: '2.0.0',
  locale: "en-US",
  tags: ["using_api_examples"],
  appId: "AayushLensDapp",
}