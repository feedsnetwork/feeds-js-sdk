import { Channel } from "./Channel"
import { ChannelEntry } from "./ChannelEntry"
import { ChannelFetcher } from "./ChannelFetcher"
import { ChannelInfo } from "./ChannelInfo"
import { Dispatcher } from "./Dispatcher"
import { MyChannel } from "./MyChannel"
import { hiveService } from "./hiveService"
import { config } from "./config"
import { Logger } from './utils/logger'

const logger = new Logger("Channel")

export class MyProfile implements ChannelFetcher {
    private readonly userDid: string;
    private readonly appDid: string;
    private readonly appInstanceDid: string;
    private hiveservice: hiveService
    private resolveCache: string;

    // 自己创建的channel count
    public fetchOwnChannelCount(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = {}
                const result = await this.hiveservice.queryDBData(config.TABLE_CHANNELS, filter)
                const channels = MyChannel.parse(this.userDid, result)
                resolve(channels.length)
            } catch (error) {
                logger.error('fetch own channel count error: ', error)
                reject(error)
            }
        })
    }

    public fetchOwnChannels(): Promise<MyChannel[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = {}
                const result = await this.hiveservice.queryDBData(config.TABLE_CHANNELS, filter)
                const channels = MyChannel.parse(this.userDid, result)
                resolve(channels)
            } catch (error) {
                logger.error('fetch own channels error: ', error)
                reject(error)
            }
        })
    }

    public fetchAndDispatchOwnChannels(dispatcher: Dispatcher<Channel>) {
        throw new Error("Method not implemented.");
    }

    public fetchOwnChannnelById(channelId: string): Promise<MyChannel> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = { "channel_id": channelId }
                const result = await this.hiveservice.queryDBData(config.TABLE_CHANNELS, filter)
                const channels = MyChannel.parse(this.userDid, result)
                resolve(channels[0])
            } catch (error) {
                logger.error('fetch own channels error: ', error)
                reject(error)
            }
        })
    }

    public fetchAndDispatchOwnChannelById(dispatcher: Dispatcher<Channel>) {
        throw new Error("Method not implemented.");
    }

    public fetchSubscriptionCount(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const params = {
                    "user_did": this.userDid
                }    
                const appid = config.ApplicationDID
                let result = await this.hiveservice.callScript(config.SCRIPT_QUERY_SUBSCRIPTION_BY_USERDID, params, this.userDid, appid)
                const subscriptionChannels = MyChannel.parseSubscriptionResult(targetDid, result)
                logger.trace("Find subscription from scripting success, result is", result)
                resolve(subscriptionChannels.length)
            } catch (error) {
                logger.error('Find subscription from scripting error:', error)
                reject(error)
            }
        })
    }

    public fetchSubscriptions(earlierThan: number, maximum: number): Promise<Channel[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const params = {
                    "user_did": this.userDid
                }
                const appid = config.ApplicationDID
                let result = await this.hiveservice.callScript(config.SCRIPT_QUERY_SUBSCRIPTION_BY_USERDID, params, this.userDid, appid)
                const subscriptionChannels = MyChannel.parseSubscriptionResult(targetDid, result)
                logger.trace("Find subscription from scripting success, result is", result)
                resolve(subscriptionChannels.length)
            } catch (error) {
                logger.error('Find subscription from scripting error:', error)
                reject(error)
            }
        })
    }

    public fetchAndDispatchSubscriptions(earlierThan: number, maximum: number, dispatcher: Dispatcher<Channel>) {
        throw new Error("Method not implemented.");
    }

    /**
     * Create a channel on remote vault
     *
     * @param name channel name
     * @param intro brief introduction to the channel
     * @param receivingAddr the ESC address to receive tipping payment
     * @param category channel category
     * @param proof [option] sigature to the channel metadata
     * @returns
     */
    public createChannel(channelInfo: ChannelInfo): Promise<MyChannel> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * Freeze channel when owner stop maintainning the channel.
     * Notice: calling this method will not remove channel metadata on remote vault
     * and also would keep all channel subscribers and all post data there. After calling
     * this method, channel owner would be unable to make posts on this channel, and
     * subscribers are also allowed to fetch posts but can not make comments on the posts.
     * This is the solf way to stop maintaining channel.
     *
     * @param channelId the channel to be freezed
     * @returns
     */

    public freezeChannel(channelId: string): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * TODO:
     *
     * @param channelId
     * @returns
     */
    public unfreezeChannel(channelId: string): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * Hard way to stop maintaining channel.
     * Warning: calling this method would lead to irreversible consequence that all Posts
     * on this channel and all subscribers would be removed and lost permanently.
     *
     * And users should unpublish (unregister) this channel from registery contract
     * on blockchain before decide to delete this channel.
     *
     * @param channelId channel id of the channel to be deleted.
     * @returns
     */
    public deleteChannel(channelId: string): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * purge channel
     *
     * @param myChannel
     * @returns
     */
    public purgeChannel(channelId: string): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * Publish channel onto Feeds channel registry contract, which is an ERC721 compatbile
     * contract as Feeds channel collection.
     *
     * @param channelId the channel Identifier to be published on registry contract.
     * @returns
     */
    public publishChannel(myChannel: MyChannel): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     *
     * @param channelId
     * @returns
     */
    public unpublishChannel(channelId: string): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * TODO:
     *
     * @param channel
     * @returns
     */
    public subscribeChannel(channelEntry: ChannelEntry): Promise<Channel> {
        throw new Error("Method not implemented");
        // TODO:
    }

    /**
     * TODO:
     *
     * @param channel
     * @returns
     */
     public unsubscribeChannel(channelEntry: ChannelEntry): Promise<boolean> {
        throw new Error("Method not implemented");
        // TODO:
    }
}