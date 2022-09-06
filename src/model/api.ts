export type ApiResponse<T> = {
    code: string
    message: string
    payload: Array<T>
}

export type TrainScheduleData = {
    color: string
    stationCode: string
    stationName: string
    timeEst: string
    trainName: string
    trainNum: string
    transit: Array<string>
    transitStation: boolean
};

export type StationData = {
    stationCode: string
    stationName: string
    area: number
    status: number
}

export type ScheduleData = {
    color: string
    destTime: string
    destination: string
    routeName: string
    timeEst: string
    trainName: string
    trainNum: string
}

export type TimeRange = {
    start: string,
    end: string
}
