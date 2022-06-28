import { IStatus } from "./types/status";
import projectTypes from '../../project.types.json';
import { IRowReport } from "./types/rowReport";

interface ITask {
    type: string;
    time: number;
    description: string;
}


const getDescriptionType = async (description: string): Promise<string | void> => { // TODO: we should add exception inside <remove void>
    for (const [type, typeInfo] of Object.entries(projectTypes)) {
        for (const keyWord of typeInfo.wildcard) {
            if (description.toLocaleLowerCase().includes(keyWord.toLocaleLowerCase())) return type;
        }
    }
}

const getTaskWithMaxTime = async (taskList: ITask[]): Promise<ITask> => {
    // TODO: We should add check for empty tasklist here

    let currentMax = taskList[0].time;
    let currentTask = taskList[0];

    for (let i = 1; i < taskList.length; i++) {
        if (currentMax < taskList[i].time) {
            currentMax = taskList[i].time;
            currentTask = taskList[i];
        }
    }

    return currentTask;
}

const timeNormalize = async (taskList: ITask[]): Promise<ITask[]> => {
    const timeDiff = 0.25;
    const expectedTime = 8;

    let groupTotalTime = taskList.reduce((acc, task) => acc += task.time, 0);

    if (groupTotalTime > expectedTime) {
        while (true) {
            if (expectedTime === groupTotalTime) break;

            const task = await getTaskWithMaxTime(taskList);

            task.time -= timeDiff

            groupTotalTime -= timeDiff
        }
    } else {
        throw new Error('You should write more fields in your status per day'); //TODO:  Add log about particular status with its date
    }

    return taskList; //TODO: get read of return because function changes args 
}

export const generateRowReports = async (statuses: IStatus[]): Promise<IRowReport[]> => {
    const rowReports: IRowReport[] = [];
    const projectType = JSON.parse(JSON.stringify(projectTypes));
    for (const status of statuses) {
        const { date, statusText } = status;
        const taskDescriptions = statusText
            .split('\n')
            .filter((description: string) => description.trim().startsWith('-'))
            .map((description: string) => description.replace(/\s{0,}-\s{0,}/, '').replace('\r', ''));

        const taskList: ITask[] = [];

        for (const taskDescription of taskDescriptions) {
            const type: string = await getDescriptionType(taskDescription) || '';
            taskList.push({
                type,
                time: projectType[type].max,
                description: taskDescription
            })
        }

        const normalizeTaskList = await timeNormalize(taskList);

        normalizeTaskList.forEach((task) => rowReports.push({
            date,
            description: task.description,
            effortTime: task.time,
            reportType: task.type
        }))
    }

    return rowReports;
}