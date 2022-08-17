import { Hive } from '@elastosfoundation/elastos-connectivity-sdk-js';
import { HiveData } from './HiveData';
import { Logger } from './utils/logger'

const logger = new Logger("Channel")

export class Channel {
    myChannelInfo: HiveData.ChannelInfo
    subscriptionChannelInfo: HiveData.SubscriptionInfo

    constructor(channelInfo: HiveData.ChannelInfo, subscriptionChannelInfo: HiveData.SubscriptionInfo) {
        this.myChannelInfo = channelInfo
        this.subscriptionChannelInfo = subscriptionChannelInfo
    }

    public getMyChannelInfo(): HiveData.ChannelInfo {
        return this.myChannelInfo
    }

    public getSubscriptionChannelInfo(): HiveData.SubscriptionInfo {
        return this.subscriptionChannelInfo
    }
}

