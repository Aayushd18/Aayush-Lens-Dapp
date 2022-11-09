import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { apolloClient, sendToIpfs } from '../utils/utils'
import { v4 as uuid } from 'uuid';
import { baseMetadata, LENS_HUB_CONTRACT_ADDRESS } from '../utils/utils';
import lens from '../utils/abi/lens.json'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ethers } from 'ethers';
import { gql } from '@apollo/client';
import { createPostTypedData } from '../utils/queries';



const ModalComponent = ({ userProfile }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { address } = useAccount();
  const [ postData, setPostData ] = useState();


  const { config } = usePrepareContractWrite({
    address: LENS_HUB_CONTRACT_ADDRESS,
    abi: lens,
    functionName: "post",
    args: [postData]
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      height: "500px",
      transform: 'translate(-50%, -50%)',
    },
  };


  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleInput(e) {
    setInput(e.target.value)
  }

  const uploadToIpfs = async () => {
    const postData = {
      content: input,
      description: input,
      name: `Post by ${userProfile.id}`,
      external_url: `https://lenster.xyz/u/${userProfile.handle}`,
      metadata_id: uuid(),
      createdOn: new Date().toISOString(),
      ...baseMetadata
    }

    const cid = await sendToIpfs(JSON.stringify(postData));
    return cid;
    
  }
  const createPostViaDispatcher = async (contentURI) => {
    const id = userProfile.id
    const timeout = () => setTimeout(() => { console.log("waiting...")}, [20000]);
    timeout()
    const res = await apolloClient.mutate({
      mutation: gql(createPostTypedData),
      variables: {
        id: id,
        url: contentURI,
      },
    })
    return res.data;
  }

  const createPost = async (contentURI) => {
    let dispatcherResult
    

    if(userProfile.dispatcher?.canUseRelay) {
      dispatcherResult = await createPostViaDispatcher(contentURI)
    }

    return dispatcherResult;
  }

  const sendPost = async (e) => {
    e.preventDefault()
    const cid = await uploadToIpfs();

    const contentURI = `https://ipfs.io/ipfs/${cid}/[object Object]`
    const dispatcherResult = await createPost(contentURI)
    console.log('create post via dispatcher: createPostViaDispatcherRequest', dispatcherResult);

    // if (dispatcherResult.__typename !== 'RelayerResult') {
    //   console.error('create post via dispatcher: failed', dispatcherResult);
    //   throw new Error('create post via dispatcher: failed');
    // }

    // return { txHash: dispatcherResult.txHash, txId: dispatcherResult.txId };
    
  }

  return (
    <section>
      <button onClick={openModal} style={{ padding: "10px", backgroundColor: "lightgreen", color: "black", fontSize: "20px", borderRadius: "15px" }}>Post Something</button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Post Modal"
        ariaHideApp={false}
      >
        <h2 style={{color: "black"}}>Welcome {userProfile.name} aka {userProfile.handle}</h2>
        <form style={{ color: "black", display: "flex", flexDirection: "column", padding: "20px" }}>
          <label style={{fontSize: "20px", marginBottom: "10px"}} htmlFor='postInput'>What's on your mind? Post Something....</label>
          <input
            style={{ height: "200px", background: "transparent", color: "black" }}
            type="textarea" id="postInput"
            onChange={handleInput}
            value={input}
           />
           <button style={{ alignSelf: "center", margin: "20px", padding: "15px", backgroundColor: "lightgreen", color: "black", borderRadius: "15px", border: "none" }} onClick={sendPost}>Post On Lens</button>
        </form>
        <button onClick={closeModal}>close</button>
      </Modal>
    </section>
  );
}

export default ModalComponent;