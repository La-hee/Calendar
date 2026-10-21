
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

    windowAPI: {
      getLocked: () => Promise<boolean>;
      setLocked: (locked: boolean) => Promise<boolean>;
      setEditing: (editing: boolean) => Promise<boolean>;
    };

    scheduleAPI: {
      getAll: () => Promise<
        {
          id: number;
          title: string;
          date: string;
          endDate?: string;
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
        endDate?: string;
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
        endDate?: string;
        time?: string;
        color?: string;
        alarm?: string;
        repeat?: string;
        memo?: string;
        completed?: boolean;
      }) => Promise<boolean>;

      remove: (id: number) => Promise<boolean>;

      toggleCompleted: (
        id: number,
        completed: boolean,
      ) => Promise<boolean>;

       getOccurrenceCompletions: () => Promise<
        {
          schedule_id: number;
          occurrence_date: string;
          completed: boolean | number;
        }[]
      >;

      toggleOccurrenceCompleted: (
        id: number,
        date: string,
        completed: boolean,
      ) => Promise<boolean>;

    };
  }
}


