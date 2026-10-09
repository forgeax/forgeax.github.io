#!/usr/bin/env node

import { Context } from './lib/index.js'
import { pathToFileURL } from 'node:url'
import Loader from '../cordis-plugin-loader/lib/index.js'

const ctx = new Context()
ctx.baseUrl = pathToFileURL(process.cwd()).href + '/'

await ctx.plugin(Loader)
await ctx.loader.create({
  name: '@deepseek-ai/cordis-plugin-include',
  config: {
    path: './cordis.yml',
  },
})
