import { promises as fs } from 'fs'
import { IModuleConfig } from '../types'

export const FSModule = ({}: IModuleConfig) => fs
