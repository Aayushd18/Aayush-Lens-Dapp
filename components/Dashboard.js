import { AUTHENTICATION, CreateProfile, getDefaultProfile, GET_CHALLENGE, GET_PUBLICATIONS_BY_ID, GET_PUBLICATIONS_QUERY } from '../utils/queries';
import { useAccount, useSignMessage } from 'wagmi'
import { gql } from '@apollo/client';
import { apolloClient } from '../utils/utils';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import ModalComponent from './Modal';

function Dashboard() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage();
  const [posts, setPosts] = useState([]);
  const [userPosts, setuserPosts] = useState();
  const [haveToken, setHaveToken] = useState(false);
  const [userProfile, setUserProfile] = useState();
  

  const generateChallenge = async (address) => {
    const res = await apolloClient.query({
        query: gql(GET_CHALLENGE),
        variables: {
            request: {
                address,
            }
        }
    });
    return res.data.challenge.text;
  }

  const getProfile = async (address) => {
    const res = await apolloClient.query({
      query: gql(getDefaultProfile),
      variables: {
        address
      }
    })
    console.log(res.data.defaultProfile)
    return res.data.defaultProfile;
  }

  const getPostsbyId = async (id) => {
    const { data } = await apolloClient.query({
      query: gql(GET_PUBLICATIONS_BY_ID),
      variables: {
        id
      }
    })
    console.log(data);
    return data.publications.items;
  }

  const authenticate = async (address, signature) => {
    const { data } = await apolloClient.mutate({
      mutation: gql(AUTHENTICATION),
      variables: {
        request: {
          address,
          signature,
        },
      },
    });

    return data.authenticate.accessToken;
  }


  const signIn = async () => {
    try {
      const challenge = await generateChallenge(address);
      const signature = await signMessageAsync({ message: challenge });
      const accessToken = await authenticate(address, signature);
      console.log({ accessToken });
      window.sessionStorage.setItem('accessToken', accessToken);

      const profile = await getProfile(address);
      console.log(profile)
      setUserProfile(profile)
      setHaveToken(true);
    } catch(err) {
      console.log(err)
    }
  }

  const getPublications = async () => {
    const { data } = await apolloClient.query({
      query: gql(GET_PUBLICATIONS_QUERY),
    });
    return data.explorePublications.items;
  };

  useEffect(() => {
    getPublications().then(setPosts);
    if (userProfile) {
      getPostsbyId(userProfile.id).then(setuserPosts);
    } else{
      console.log("continue")
    }
  }, [userProfile, userPosts]);

  

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "30px" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button onClick={signIn} style={{ marginRight: "12px", padding: "10px", backgroundColor: "lightgreen", color: "black", fontSize: "20px", borderRadius: "15px" }}>Sign In</button>
        {
          haveToken ? 
            <ModalComponent userProfile={userProfile} />
          : <p>Sign In to Post via lens</p>
        }
      
      </div>
      {
        userProfile &&
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h2>{userProfile.name}</h2>
          <h3>{userProfile.handle}</h3>
        </div>
      }
      <div style={{ alignSelf: "flex-start", padding: "40px" }}>
        <h2 style={{color: "wheat"}}>My Posts</h2>
        {userPosts ?
          userPosts
            .filter((userPost) => userPost.__typename === "Post")
            .map((userPost) => {
              return (
                <div key={userPost.id} style={{margin: "20px", backgroundColor: "purple", padding: "20px", borderRadius: "15px"}}>
                <h2>{userPost.metadata?.description}</h2>
              </div>
              )
            }) : <p style={{color: "white"}}>Sign in to see your posts</p>
        }
      </div>
      <div style={{padding: "40px"}}>
        <h2 style={{color: "wheat"}}>Others Posts</h2>
        {posts
          .filter((post) => post.__typename === 'Post') // we need to filter the list to make sure we are not rendering anything other than Posts, like comments and other formats.
          .map((post) => {
            return (
              <div key={post.id} style={{margin: "20px", backgroundColor: "purple", padding: "20px", borderRadius: "15px"}}>
              <h2>
                    {post.profile?.handle || post.profile?.id}
                  </h2>
                <h2>{post.metadata?.content}</h2>
              </div>
            );
          })}
      </div>
    </div>
  )
}



export default Dashboard;