import * as TypeORM from 'typeorm';

class Model extends TypeORM.BaseEntity {}

enum SubmissionStatus {
    ACCEPTED = 1,
    COMPILE_ERROR = 2,
    UNACCEPTED = 3,
    WAITING = 0
}

enum SubmissionDetailStatus {
    ACCEPTED = 1,
    COMPILE_ERROR = 2,
    FILE_ERROR = 3,
    JUDGEMENT_ERROR = 4,
    MEMORY_LIMIT_EXCEEDED = 5,
    OUTPUT_LIMIT_EXCEEDED = 6,
    PARTIALLY_CORRECT = 7,
    RUNTIME_ERROR = 8,
    SYSTEM_ERROR = 9,
    TESTDATA_ERROR = 10,
    TIME_LIMIT_EXCEEDED = 11,
    UNKNOWN_ERROR = 12,
    WRONG_ANSWER = 13,
    WAITING = 0
}

function getSubmissionStatus(status: number): SubmissionStatus {
    if (status === 1) return SubmissionStatus.ACCEPTED;
    if (status === 2) return SubmissionStatus.UNACCEPTED;
    if (status === 7) return SubmissionStatus.COMPILE_ERROR;
    return SubmissionStatus.WAITING;
}

function getSubmissionDetailStatus(status: number): SubmissionDetailStatus {
    if (status === 1) return SubmissionDetailStatus.ACCEPTED;
    if (status === 2) return SubmissionDetailStatus.WRONG_ANSWER;
    if (status === 3) return SubmissionDetailStatus.TIME_LIMIT_EXCEEDED;
    if (status === 4) return SubmissionDetailStatus.MEMORY_LIMIT_EXCEEDED;
    if (status === 5) return SubmissionDetailStatus.RUNTIME_ERROR;
    if (status === 6) return SubmissionDetailStatus.SYSTEM_ERROR;
    if (status === 7) return SubmissionDetailStatus.COMPILE_ERROR;
    if (status === 8) return SubmissionDetailStatus.COMPILE_ERROR;
    if (status === 9) return SubmissionDetailStatus.COMPILE_ERROR;
    if (status === -1) return SubmissionDetailStatus.UNKNOWN_ERROR;
}

export {
    Model, SubmissionStatus, SubmissionDetailStatus,
    getSubmissionStatus, getSubmissionDetailStatus
};
