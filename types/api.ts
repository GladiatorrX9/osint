export interface LeakOSINTRequest {
  token: string;
  request: string;
  limit: number;
  lang: string;
}

export interface LeakOSINTResponse {
  List: {
    [dbName: string]: {
      Data: any[];
      NumOfResults: number;
      InfoLeak: string;
    };
  };
  NumOfDatabase: number;
  NumOfResults: number;
  "search time": number;
}
