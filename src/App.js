import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { w3 } from "./services/w3";
import { AppBar, Typography, Button } from "@mui/material";
import "./App.css";
import { ethers } from "ethers";
import { ConnectWallet } from "./components/ConnectWallet";
const contractJson = require("./contract/NFT.json");

const Header = styled(AppBar)`
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  & div {
    display: flex;
    align-items: center;
    & Typography {
      margin-left: 0.5rem;
    }
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  padding: 0 2rem;

  div {
    display: flex;
    align-items: center;
    flex-direction: column;
    align-content: space-between;
  }
`;

function App() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const tokenPrice = ethers.utils.parseEther("0.0001");

  useEffect(() => {
    if (window.ethereum) {
      setTimeout(() => {
        setIsConnected(w3.isConnected()); // wait a little bit to check if metamask is connected because it takes a bit to load
      }, 300);
    }
  }, [w3.accounts]);

  w3.onAccountChanged = (account) => {
    setIsConnected(account !== null);
    if (account) setAccount(account);
  };

  w3.onDisconnect = () => {
    setAccount("");
    setConnected(false);
    setContract(null);
  };

  function setIsConnected(isConnected) {
    setConnected(isConnected);
    if (isConnected) {
      (async () => {
        const provider = await w3.getProvider();
        const signer = await provider.getSigner();
        const _contract = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADD,
          contractJson.abi,
          signer
        );
        setContract(_contract);
      })();
    } else {
      setContract(null);
    }
  }

  async function onMint(amount) {
    if (!w3.isCorrectEthereumNetwork()) {
      await w3.connectToEthereum();
      return;
    }
    try {
      const tx = await contract.mintPublicSale(amount, {
        value: tokenPrice.mul(amount),
      });
      await tx.wait();
    } catch (error) {
      alert("Error - " + error.error.message);
    }
    window.location.reload();
  }

  return (
    <div className="App">
      <Main>
        {connected ? (
          <div>
            <div>{account}</div>
            <Button
              variant="contained"
              color="warning"
              onClick={() => onMint(1)}
            >
              Mint
            </Button>
          </div>
        ) : (
          <ConnectWallet />
        )}
      </Main>
    </div>
  );
}

export default App;