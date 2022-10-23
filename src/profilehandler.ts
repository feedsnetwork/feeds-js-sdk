import { ChannelInfo } from "./channelinfo";

interface ProfileHandler {
    /**
     * Query the total number of owned channels.
     * @returns A promise object that contains the number of owned channels.
     */
    queryOwnedChannelCount(): Promise<number>;

    /**
     * Query a list of owned channel.
     * @returns A promise object that contains a list of channel.
     */
    queryOwnedChannels(): Promise<ChannelInfo[]>;

    /**
     * Query specific owned channel by channel identifier
     * @param channelId
     * @returns A promise object that contains Channel
     */
    queryOwnedChannnelById(channelId: string): Promise<ChannelInfo>;

    /**
     * Query the total acount of subscribed channels.
     * @returns A promise object that contain the total number of subscribed channels.
     */
     querySubscriptionCount(): Promise<number>;

     /**
      * Query a list of subscribed channels.
      */
    querySubscriptions(): Promise<ChannelInfo[]>;
}

export type {
    ProfileHandler
}
