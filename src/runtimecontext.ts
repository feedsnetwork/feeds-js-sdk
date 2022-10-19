import { JWTHeader, JWTParserBuilder, Logger as HiveLogger, DIDDocument, DIDBackend, DefaultDIDAdapter, VerifiablePresentation } from '@elastosfoundation/did-js-sdk'
import { Logger } from './utils/logger'
import { signin, signout, checkSignin } from './signin'
import { Vault, AppContext, ScriptRunner } from '@elastosfoundation/hive-js-sdk'
import { connectivity, DID as ConDID, Hive } from "@elastosfoundation/elastos-connectivity-sdk-js"
import { Register } from './register'
import { MyProfile } from './myprofile'
const logger = new Logger("AppContext")

export class RuntimeContext {
    private static sInstance: RuntimeContext = null
    private scriptRunners: { [key: string]: ScriptRunner } = {}
    private vault: Vault = null;
    private hiveVault: Vault
    private register: Register

    private applicationDid = ""
    private networkType: string

    private readonly resolveCache: string
    private readonly localDataDir: string
    private readonly appInstanceDIDDocument: string // todo
    private userDid: string

    private constructor(applicationDid: string, networkType: string, localDataDir: string, resolveCache: string) {
        this.applicationDid = applicationDid
        this.networkType = networkType
        this.localDataDir = localDataDir
        this.resolveCache = resolveCache
        this.register = new Register()
    }

    public getAppDid(): string {
        return this.applicationDid
    }

    public setUserDid(userDid: string) {
        this.userDid = userDid
    }

    public getUserDid(): string {
        return this.userDid
    }

    public getNetwork(): string {
        return this.networkType
    }

    getHiveVault(): Vault {
        return this.hiveVault
    }

    public getAppInstanceDIDDocument(): string {
        return this.appInstanceDIDDocument
    }

    public getScriptRunners(userDid: string): ScriptRunner {
        return this.scriptRunners[userDid]
    }

    /**
    * initialization RuntimeContext
    * @param applicationDid： application did：
    * @param networkType: mainnet/testnet
    * @param localDataDir: The path to store the hive local cache
    * @param resolveCache: The path to store did local cache
    */
    public static initialize(applicationDid: string, networkType: string, localDataDir: string, resolveCache: string) {
        this.sInstance = new RuntimeContext(applicationDid, networkType, localDataDir, resolveCache)
        HiveLogger.setLevel(HiveLogger.TRACE)
        try {
            AppContext.setupResolver(networkType, resolveCache)
        } catch (error) {
            logger.info(`Initalized DIDBackend with resolver URL: error`, error)
        }
        logger.info(`Initalized DIDBackend with resolver URL: ${networkType}`)
    }

    // Get RuntimeContext instance
    public static getInstance(): RuntimeContext {
        if (this.sInstance == null) {
            throw new Error("The AppContext was not initialized. Please call AppContext.initialize(applicationDid, currentNet)")
        }
        return this.sInstance
    }

    // Whether the RuntimeContext is initialized
    public static isInitialized(): boolean {
        return this.sInstance !== null
    }

    // Get the path to store did local cache
    public getResolveCache(): string {
        return this.resolveCache
    }

    // Get the path to store the hive local cache
    public getLocalDataDir(): string {
        return this.localDataDir
    }

    // login essential
    public async signin() {
        let myProfile: MyProfile
        let self = this
        return signin(this).then(profile => {
            myProfile = profile
            return self.signHive()
        }).then(_ => {
            return myProfile
        }).catch(error => {
            throw error
        })
    }

    // log out essential
    public signout() {
        return signout()
    }

    // Check if you are logged in to essential
    public checkSignin() {
        return checkSignin()
    }

    public async signToHive(userDid: string): Promise<MyProfile> {
        try {
            let self = this
            await self.register.prepareConnectHive()
            logger.debug('sign to Hive success')
            try {
            await self.register.checkCreateAndRregiste(true) // 注册 创建
            } catch (error) {
                //ignore
            }
            const myProfile = new MyProfile(this, userDid, null, null)
            return myProfile
        } catch (error) {
            logger.error('sign to Hive error: ', error)
            throw error
        }
    }

    // login hive
    private signHive(): Promise<void> {
        let self = this
        return self.register.prepareConnectHive().then(()=> {
            return self.register.checkCreateAndRregiste(true) // 注册 创建
        }).catch(error => {
            //ignore
        })
    }

    private signIntoVault(userDid: string, appInstanceDIDDocument: DIDDocument): Promise<AppContext> {
        let self = this
        return AppContext.build({
            getLocalDataDir: (): string => this.getLocalDataDir(),
            getAppInstanceDocument: (): Promise<DIDDocument> => Promise.resolve(appInstanceDIDDocument),
            getAuthorization: (jwtToken: string): Promise<string> => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const authToken = await self.generateHiveAuthPresentationJWT(jwtToken)
                        resolve(authToken)
                    } catch (error) {
                        logger.error("Generate hive auth presentation JWT error: ", error)
                        reject(error)
                    }
                })
            }
        }, userDid, this.getAppDid()).then((context) => {
            return context
        }).catch((error) => {
            logger.error("Build HiveContext error: ", error)
            throw error
        })
    }

    private async getAppInstanceDIDDoc() {
        const didAccess = new ConDID.DIDAccess()
        const info = await didAccess.getOrCreateAppInstanceDID()
        const instanceDIDDocument = await info.didStore.loadDid(info.did.toString())
        return instanceDIDDocument
    }

    private async issueDiplomaFor() {
        const applicationDID = RuntimeContext.getInstance().getAppDid()
        connectivity.setApplicationDID(applicationDID)
        const didAccess = new ConDID.DIDAccess()
        let credential = await didAccess.getExistingAppIdentityCredential()
        if (credential) {
            return credential
        }
        credential = await didAccess.generateAppIdCredential()
        if (credential) {
            return credential
        }
    }

    private async createPresentation(vc, hiveDid, nonce) {
        const access = new ConDID.DIDAccess()
        const info = await access.getOrCreateAppInstanceDID()
        const info2 = await access.getExistingAppInstanceDIDInfo()
        const vpb = await VerifiablePresentation.createFor(info.did, null, info.didStore)
        const vp = await vpb.credentials(vc).realm(hiveDid).nonce(nonce).seal(info2.storePassword)
        return vp
    }

    private async generateHiveAuthPresentationJWT(challeng: string) {

        if (challeng === null || challeng === undefined || challeng === '') {
            // throw error // todo
        }

        // Parse, but verify on chain that this JWT is valid first
        const JWTParser = new JWTParserBuilder().build()
        const parseResult = await JWTParser.parse(challeng)
        const claims = parseResult.getBody()
        if (claims === undefined) {
            return // 抛出error
        }
        const payload = claims.getJWTPayload()
        const nonce = payload['nonce'] as string
        const hiveDid = claims.getIssuer()
        const appIdCredential = await this.issueDiplomaFor()
        const presentation = await this.createPresentation(appIdCredential, hiveDid, nonce)
        const token = await this.createChallengeResponse(presentation, hiveDid)

        return token
    }

    private async createChallengeResponse(vp, hiveDid) {
        const exp = new Date()
        const iat = new Date().getTime()
        exp.setFullYear(exp.getFullYear() + 2)
        const expTime = exp.getTime()

        // Create JWT token with presentation.
        const doc = await this.getAppInstanceDIDDoc()
        const info = await new ConDID.DIDAccess().getExistingAppInstanceDIDInfo()
        const token = await doc.jwtBuilder()
            .addHeader(JWTHeader.TYPE, JWTHeader.JWT_TYPE)
            .addHeader("version", "1.0")
            .setSubject("DIDAuthResponse")
            .setAudience(hiveDid)
            .setIssuedAt(iat)
            .setExpiration(expTime)
            .claimsWithJson("presentation", vp.toString(true))
            .sign(info.storePassword)
        return token
    }

    public getScriptRunner(targetDid: string): Promise<ScriptRunner> {
        if (this.scriptRunners[targetDid] != null && this.scriptRunners[targetDid] != undefined)
            return Promise.resolve(this.scriptRunners[targetDid]);

        return this.getAppInstanceDIDDoc().then((appInstanceDIDDoc) => {
            return this.signIntoVault(targetDid, appInstanceDIDDoc);
        }).then(context => {
            this.scriptRunners[targetDid] = new ScriptRunner(context);
            return this.scriptRunners[targetDid];
        }).catch (error => {
            logger.error(`Create a scriptRunner object for ${targetDid} failed`);
            throw new Error(error);
        })
    }

    public getVault(): Promise<Vault> {
        if (this.vault != null)
            return Promise.resolve(this.vault);

        const userDid = RuntimeContext.getInstance().getUserDid();
        return this.getAppInstanceDIDDoc().then((appInstanceDIDDoc) => {
            return this.signIntoVault(userDid, appInstanceDIDDoc);
        }).then(context => {
            this.scriptRunners[userDid] = new ScriptRunner(context);
            this.vault = new Vault(context);
            return this.vault;
        }).catch (error => {
            logger.error(`Create a vault object for ${userDid} failed`);
            throw new Error(error);
        })
    }
}

