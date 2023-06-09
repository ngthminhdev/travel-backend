export enum BooleanEnum {
  False,
  True,
}

export enum TimeToLive {
  TenSeconds = 10,
  HaftMinute = 30,
  Minute = 60,
  FiveMinutes = 300,
  FiveMinutesMilliSeconds = 300000,
  OneHour = 3600,
  OneDay = 86400,
  OneYear = 31556926,
  OneDayMilliSeconds = 86400000,
  OneWeek = 604800,
  OneWeekMilliSeconds = 604800000,
  Forever = -1,
}

export enum ResourceTypeEnum {
  Image,
  Video,
  Audio,
  File,
}

export enum TourStatusTypeEnum {
  All = -1,
  Ordered = 0,
  Paymented = 1,
  Confirmed = 2,
  Done = 3,
  Canceled = 4,
}
