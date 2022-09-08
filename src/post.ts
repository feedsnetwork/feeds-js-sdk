import { Logger } from './utils/logger'
import { PostBody } from './postbody'
import { Dispatcher } from './dispatcher';
import { Comment } from './comment'
import { hiveService } from "./hiveService"
import { AppContext } from './appcontext';
import { ScriptingNames as scripts } from './vault/constants';

//const logger = new Logger("Post")

export class PostA {
    //private appContext: AppContext;
   // private body1: PostBody;
    //private vault: hiveService

    //private constructor(body: PostBody) {
        //his.body1 = body;
    //}

    public getBody(): PostBody {
        //return this.body1
        return null;
    }

    public addComent(): Promise<string> {
        throw new Error("Method not implemented");
    }

    public updateComment(commentId: string): Promise<void> {
        throw new Error("Method not implemented");
    }

    public deleteComment(commentId: string) {
        /*
        return new Promise( async(resolve, _reject) => {
            const params = {
                "channel_id": this.getBody().getChannelId(),
                "post_id": this.getBody().getPostId(),
                "comment_id": commentId
            }
            const targetDid = this.getBody().getTargetDid()

            const result = await this.vault.callScript(scripts.SCRIPT_DELETE_COMMENT, params,
                targetDid, this.appContext.getAppDid())
            // TODO: error.
            resolve(result)
        }).then( result => {
            // TODO:
        }).catch (error => {
            logger.error('Delete comment error:', error)
            throw new Error(error)
        });*/
        throw new Error("Not implemented");
    }

    public queryComments(earlierThan: number, maximum: number): Promise<Comment[]> {
        /*
        return new Promise<Comment[]>(async (resolve, _reject) => {
            const params = {
                "channel_id": this.getBody().getChannelId(),
                "post_id": this.getBody().getPostId(),
                "limit": { "$lt": maximum },
                "created": { "$gt": earlierThan }
            }
            const result = await this.vault.callScript(scripts.SCRIPT_SOMETIME_COMMENT, params,
                this.getBody().getTargetDid(), this.appContext.getAppDid())

            // TODO: error
            resolve(result)
        }).then(result => {
            // TODO:
            return result
        }).catch(error => {
            logger.error('fetch comments error:', error)
            throw new Error(error)
        })*/
        throw new Error("Method not implemented");
    }

    public queryAndDispatchComments(earlierThan: number, maximum: number,
        dispatcher: Dispatcher<Comment>) {
        return this.queryComments(earlierThan, maximum).then((comments) => {
            comments.forEach(item => {
                dispatcher.dispatch(item)
            })
        }).catch( error => {
            throw new Error(error)
        })
    }

    public queryCommentsRangeOfTime(begin: number, end: number, maximum: number): Promise<Comment[]> {
       /*
        return new Promise<Comment[]>(async (resolve, _reject) => {
            const params = {
                "channel_id": this.getBody().getChannelId(),
                "post_id": this.getBody().getPostId(),
                "start": begin,
                "end": end
            }
            const result = await this.vault.callScript(scripts.SCRIPT_SOMETIME_COMMENT, params,
                this.getBody().getTargetDid(), this.appContext.getAppDid())
            // TODO: error.
            resolve(result)
        }).then(result => {
            // TODO:
            return result
        }).catch(error => {
            logger.error('fetch comments range of time error:', error)
            throw new Error(error)
        })*/
        throw new Error("NOt implemented");
    }

    public queryAndDispatchCommentsRangeOfTime(begin: number, end: number, maximum: number,
        dispatcher: Dispatcher<Comment>) {
        return this.queryComments(begin, end).then((comments) => {
            comments.forEach(item => {
                dispatcher.dispatch(item)
            })
        }).catch( error => {
            throw new Error(error)
        })
    }

    public queryCommentById(commentId: string): Promise<Comment> {
    /*
        return new Promise<Comment>(async (resolve, _reject) => {
            const params = {
                "channel_id": this.getBody().getChannelId(),
                "post_id": this.getBody().getPostId(),
                "comment_id": commentId
            }
            const result = await this.vault.callScript(scripts.SCRIPT_QUERY_COMMENT_BY_POSTID, params,
                this.getBody().getTargetDid(), this.appContext.getAppDid())
            //TODO:
            resolve(result)
        }).then(result => {
            // TODO:
            return result
        }).catch(error => {
            logger.error('fetch comment by id error:', error)
            throw new Error(error)
        })*/
        throw new Error("Not implemented");
    }

    public queryAndDispatchCommentById(commentId: string, dispatcher: Dispatcher<Comment>) {
        return this.queryCommentById(commentId).then((comment) => {
            dispatcher.dispatch(comment)
        }).catch( error => {
            throw new Error(error)
        })
    }

    public static parse(targetDid: string, result: any): PostA {
        /*
        try {
            const postChun = PostBody.parse(targetDid, result)
            const post = new Post(postChun)
            return post
        } catch (error) {
            //logger.error('Parse post result error: ', error)
            throw error
        }*/
        return null;
    }
}
