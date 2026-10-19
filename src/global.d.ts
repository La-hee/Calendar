
export {};

declare global {
  interface Window {
    holidayAPI: {
      getHolidays: (
        year: number,
        month: number,
      ) => Promise<
        {
          date: string;
          name: string;
        }[]
      >;
    };

    scheduleAPI: {
      getAll: () => Promise<
        {
          id: number;
          title: string;
          date: string;
          time: string;
          color: string;
          alarm: string | number;
          repeat: string;
          memo: string;
          completed: boolean | number;
        }[]
      >;

      add: (schedule: {
        title: string;
        date: string;
        time?: string;
        color?: string;
        alarm?: string;
        repeat?: string;
        memo?: string;
        completed?: boolean;
      }) => Promise<number>;

      update: (schedule: {
        id: number;
        title: string;
        date: string;
        time?: string;
        color?: string;
        alarm?: string;
        repeat?: string;
        memo?: string;
        completed?: boolean;
      }) => Promise<boolean>;

      toggleCompleted: (
        id: number,
        completed: boolean,
      ) => Promise<boolean>;
    };
  }
}
