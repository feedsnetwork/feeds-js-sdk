
import { VerifiablePresentation} from '@elastosfoundation/did-js-sdk';
import { DID, connectivity } from '@elastosfoundation/elastos-connectivity-sdk-js';
import { EssentialsConnector } from '@elastosfoundation/essentials-connector-client-browser';

import { AppContext } from './appcontext';
import { MyProfile } from "./myprofile"
import { Logger } from './utils/logger'

const logger = new Logger("Signin")

const essentialsConnector = new EssentialsConnector();
let connectivityInitialized = false;
let isSignin = false;

const isInAppBrowser = ():boolean => {
    return  window['elastos'] !== undefined && window['elastos'].name === 'essentialsiab';
}

const isUsingEssentialsConnector = () => {
    const activeConnector = connectivity.getActiveConnector();
    return activeConnector && activeConnector.name === essentialsConnector.name;
}

const initConnectivitySDK = async (appCtx: AppContext) => {
    if (connectivityInitialized) return;

    logger.info('Preparing the Elastos connectivity SDK');

    // unregistear if already registerd
    const arrIConnectors = connectivity.getAvailableConnectors();
    if (arrIConnectors.findIndex((option) => option.name === essentialsConnector.name) !== -1) {
        await connectivity.unregisterConnector(essentialsConnector.name);
        logger.info('unregister connector succeed.');
    }

    await connectivity.registerConnector(essentialsConnector).then(async () => {
        connectivity.setApplicationDID(appCtx.getAppDid())
        connectivityInitialized = true;

        logger.info('essentialsConnector', essentialsConnector);
        logger.info('Wallet connect provider', essentialsConnector.getWalletConnectProvider());

        const hasLink = isUsingEssentialsConnector() && essentialsConnector.hasWalletConnectSession();
        logger.info('Has link to essentials?', hasLink);

        // Restore the wallet connect session - TODO: should be done by the connector itself?
        if (hasLink && !essentialsConnector.getWalletConnectProvider().connected)
            await essentialsConnector.getWalletConnectProvider().enable();
    });
}

const signOutWithEssentials = async () => {
    if (isUsingEssentialsConnector() && essentialsConnector.hasWalletConnectSession()) {
        await essentialsConnector.disconnectWalletConnect().catch (error => {
            logger.info("Error while disconnecting the Essentials wallet", error);
        })
    }

    if (isInAppBrowser() && (await window['elastos'].getWeb3Provider().isConnected())) {
        await window['elastos'].getWeb3Provider().disconnect().catch (error => {
            logger.info("Error while disconnecting the wallet")
        })
    }
};

const signInWithEssentials = async (appContext: AppContext): Promise<MyProfile> => {
    await initConnectivitySDK(appContext).catch(error => {
        throw new Error(error);
    })

    const didAccess = new DID.DIDAccess();
    const claims = [
        DID.simpleIdClaim('Your avatar', 'avatar', false),
        DID.simpleIdClaim('Your name', 'name', false),
        DID.simpleIdClaim('Your description', 'description', false)
    ]

    return await didAccess.requestCredentials({ claims: claims }).then (presentation => {
        const userDid = presentation.getHolder().getMethodSpecificId();
        logger.info("The holder Did of requested credential :", userDid)

        const vp = VerifiablePresentation.parse(JSON.stringify(presentation.toJSON()));
        const hoderDid = vp.getHolder().toString();
        if (!hoderDid) {
            logger.error('Unable to extract owner DID from the presentation')
            throw new Error("No DID extracted from presentation");
        }

        const nameCredential = vp.getCredential(`name`);
        const bioCredential  = vp.getCredential(`description`);

        let walletAddress = essentialsConnector.getWalletConnectProvider().wc.accounts[0]
        if (isInAppBrowser()) {
            walletAddress = window['elastos'].getWeb3Provider().address;
        }

        isSignin = true;
        return new MyProfile(userDid, nameCredential, bioCredential, walletAddress);
    }).catch (async error => {
        await essentialsConnector.getWalletConnectProvider().disconnect();
        logger.error(error);
        throw new Error(error);
    }).catch (error => {
        logger.error(error);
        throw new Error(error);
    })
}

const signin = async (appContext: AppContext): Promise<MyProfile> => {
    if (isUsingEssentialsConnector()) {
      await signOutWithEssentials();
    }

    if (essentialsConnector.hasWalletConnectSession()) {
      await essentialsConnector.disconnectWalletConnect();
    }

    return signInWithEssentials(appContext);
}

const signout = async () => {
  await signOutWithEssentials();
  isSignin = false;
}

const checkSignin = () => {
  return isSignin;
}

export {
    signin,
    signout,
    checkSignin
}
