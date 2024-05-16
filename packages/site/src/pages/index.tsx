import styled from 'styled-components';
import { Buffer } from 'buffer';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  CardWithInput,
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useInvokeSnap,
  useMetaMaskContext,
  useRequestSnap,
} from '../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';
import { useState } from 'react';
import { KeyringAccount, KeyringRequest, KeyringSnapRpcClient } from '@metamask/keyring-api';
import { JsonRpcRequest } from '@metamask/keyring-api/dist/JsonRpcRequest';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const SimpleButton = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  color: #BF4F74;
  background: papayawhip;
  border: none;
  border-radius: 3px;
`;

export type KeyringState = {
  accounts: KeyringAccount[];
};

const initialState: {
  accounts: KeyringAccount[];
} = {
  accounts: [],
};

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();
  const [accessToken, setAccessToken] = useState("default_access_token");
  const [snapState, setSnapState] = useState<KeyringState>(initialState);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  let client: KeyringSnapRpcClient;
  if (typeof window !== "undefined") {
    client = new KeyringSnapRpcClient(defaultSnapOrigin, window.ethereum);
  }

  const syncAccounts = async () => {
    const accounts = await client.listAccounts();

    console.log(`Sync Accounts: ${JSON.stringify(accounts, null, 4)}`);

    setSnapState({
      ...snapState,
      accounts,
    });
  };

  const handleSendCommandClick = async (method: string) => {
    await invokeSnap({ method, params: {
      firstName: "Facundo",
      lastName: "La Rocca",
    } });
  };

  const handleStoreDataClick = async () => {
    const result = await invokeSnap({ method: "store_data", params: {
      accessToken
    } });

    console.log(result);
  }

  const handleRetrieveDataClick = async () => {
    const result = await invokeSnap({ method: "retrieve_data"});
    console.log(result);
  }

  const handleCreateAccountClick = async () => {
    const newAccount = await client.createAccount();
    await syncAccounts();

    console.log(newAccount);

    return newAccount;
  }

  const handleSignDataClick = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
  
    if(!accounts) {
      throw new Error("Account not authorized");
    }

    const from = accounts[0];
    const msg = `0x${Buffer.from("some message", "utf8").toString("hex")}`;

    try {
      const sign = await window.ethereum // Or window.ethereum if you don't support EIP-6963.
      .request({
        method: "personal_sign",
        params: [msg, from],
      });

      console.log(`Sign Data: ${sign}`);
    } catch (error) {
      console.error(JSON.stringify(error));
    }


      // "Must specify a non-empty string "message" less than 50 characters long."
    // const result = await client.submitRequest({
    //   id: "279096aa-bdca-482e-9ae3-8fb3cc4db4ae",
    //   account: "279096aa-bdca-482e-9ae3-8fb3cc4db4ae",
    //   scope: "1",
    //   request: {
    //       method: "personal_sign",
    //       params: {
    //         data: "some data"
    //       }
    //   }
    // });
  }

  const handleSignTxClick = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
  
    if(!accounts) {
      throw new Error("Account not authorized");
    }

    const from = accounts[0];
    const to = "0xbFFacb8Dd2CdF96C4F9186F8703E3B7eC7D89074";

    const msgParams = JSON.stringify({
      domain: {
        chainId: 11155111,
        name: "Demo contract",
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        version: "1",
      },
      message: {
        contents: "Hello, Bob!",
        attachedMoneyInEth: 0.01,
        from: {
          name: "Cow",
          wallets: [
            "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
          ],
        },
        to: [
          {
            name: "Bob",
            wallets: [to],
          },
        ],
      },
      // This refers to the keys of the following types object.
      primaryType: "Mail",
      types: {
        // This refers to the domain the contract is hosted on.
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        // Not an EIP712Domain definition.
        Group: [
          { name: "name", type: "string" },
          { name: "members", type: "Person[]" },
        ],
        // Refer to primaryType.
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person[]" },
          { name: "contents", type: "string" },
        ],
        // Not an EIP712Domain definition.
        Person: [
          { name: "name", type: "string" },
          { name: "wallets", type: "address[]" },
        ],
      },
    });

    window.ethereum // Or window.ethereum if you don't support EIP-6963.
    .sendAsync({
        method: "eth_signTypedData_v4",
        params: [from, msgParams]
      } as JsonRpcRequest, (err, result) => {
        console.log(`Error: ${JSON.stringify(err, null, 4)}`);
        console.log(`Result: ${JSON.stringify(result, null, 4)}`);
      });
  }

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send Dialog message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={() => handleSendCommandClick("dialog")}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Send Notify message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={() => handleSendCommandClick("notify")}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <CardWithInput
          content={{
            title: 'Store data',
            description:
              'Get your data to store it securily in MM',
            button: (
              <SimpleButton 
                onClick={handleStoreDataClick}
                disabled={!installedSnap}>Store data
              </SimpleButton>
            ),
            input: (
              <Input defaultValue="access_token" type="text" onChange={(event) => setAccessToken(event.target.value)}/>
            )
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Retrieve data',
            description:
              'Retrieve data stored in MM',
            button: (
              <SimpleButton 
                onClick={handleRetrieveDataClick}
                disabled={!installedSnap}>Retrieve data
              </SimpleButton>
            )
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Create Account',
            description:
              'Create an MPC account.',
            button: (
              <SimpleButton 
                onClick={handleCreateAccountClick}
                disabled={!installedSnap}>Create
              </SimpleButton>
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Personal Sign',
            description:
              'Just sign some data',
            button: (
              <SimpleButton 
                onClick={handleSignDataClick}
                disabled={!installedSnap}>Sign Data
              </SimpleButton>
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Sign TX',
            description:
              'Sign TX (invalid)',
            button: (
              <SimpleButton 
                onClick={handleSignTxClick}
                disabled={!installedSnap}>Sign TX
              </SimpleButton>
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
