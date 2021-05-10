import { Service } from 'egg';
import ContestPlayer from '../model/ContestPlayer';
import Contest from '../model/Contest';

class ContestService extends Service {
    public async checkUserInContest(userId: number, contestId: number) {
        const user = await ContestPlayer.findOne({ where: {
            contestId: contestId,
            userId: userId
        }});
        if (!user) return false;
        return true;
    }

    public async checkContestState(contestId: number) {
        const contest = await Contest.findOne({ where: { contestId: contestId }});
        if (!contest) return false;
        const reqTime = Math.floor(this.ctx.starttime / 1000);
        if (contest.startTime <= reqTime && contest.endTime >= reqTime) {
            return true;
        }
        return false;
    }
}

export default ContestService;
