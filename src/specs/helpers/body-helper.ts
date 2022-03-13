import {Project} from "../../schemas/types/project";

export const projectCorrectBody = (supplyId1: string, supplyId2: string): Project => {
  return {
    name: 'Project name',
    description: 'Project description',
    todo: [{
      name: 'ToDo1',
      description: 'First to-do item',
      completed: false,
      suppliesRequired: [
        {"supplyId": supplyId1, "quantity": 3},
        {"supplyId": supplyId2, "quantity": 2}
      ]
    }]
  }
};
