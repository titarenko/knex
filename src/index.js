
import Raw from './raw';
import { warn } from './helpers';
import Client from './client';

import makeKnex from './util/make-knex';
import parseConnection from './util/parse-connection';

import { assign } from 'lodash'

// The client names we'll allow in the `{name: lib}` pairing.
const aliases = {
  'mariadb' : 'maria',
  'mariasql' : 'maria',
  'pg' : 'postgres',
  'postgresql' : 'postgres',
  'sqlite' : 'sqlite3'
};

export default function Knex(config) {
  if (typeof config === 'string') {
    const parsed = parseConnection(config)
    return new Knex(assign({
      client: parsed.client,
      connections: [parsed.connection]
    }, arguments[2]))
  }
  let Dialect;
  if (arguments.length === 0 || (!config.client && !config.dialect)) {
    Dialect = Client
  } else if (typeof config.client === 'function' && config.client.prototype instanceof Client) {
    Dialect = config.client
  } else {
    const clientName = config.client || config.dialect
    Dialect = require(`./dialects/${aliases[clientName] || clientName}/index.js`)
  }
  if (config.connection) {
    config.connections = [config.connection]
    delete config.connection
  }
  if (typeof config.connections === 'string') {
    config.connections = config.connections.split(/\s/)
  }
  if (Array.isArray(config.connections) && typeof config.connections[0] === 'string') {
    config.connections = config.connections.map(function (it) {
      return parseConnection(it).connection;
    });
  }

  return makeKnex(new Dialect(config))
}

// Expose Client on the main Knex namespace.
Knex.Client = Client

Object.defineProperties(Knex, {
  VERSION: {
    get() {
      warn(
        'Knex.VERSION is deprecated, you can get the module version' +
        "by running require('knex/package').version"
      )
      return '0.12.6'
    }
  },
  Promise: {
    get() {
      warn(`Knex.Promise is deprecated, either require bluebird or use the global Promise`)
      return require('bluebird')
    }
  }
})

// Run a "raw" query, though we can't do anything with it other than put
// it in a query statement.
Knex.raw = (sql, bindings) => {
  warn('global Knex.raw is deprecated, use knex.raw (chain off an initialized knex object)')
  return new Raw().set(sql, bindings)
}

// Doing this ensures Browserify works. Still need to figure out
// the best way to do some of this.
if (process.browser) {
  require('./dialects/websql/index.js')
}
