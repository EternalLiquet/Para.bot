import { id } from 'mongodb-typescript';
import { inject } from 'inversify';
import { TYPES } from '../types';
import { DbClient } from '../dbclient';
import { Repository } from 'mongodb-typescript';

export class ParabotLevels {
    @id Level: number;
    ExpRequirement: number;

    constructor(Level: number, ExpRequirement: number) {
        this.Level = Level;
        this.ExpRequirement = ExpRequirement;
    }
}