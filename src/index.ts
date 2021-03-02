import fetch from 'node-fetch'
import { BaseConnector, Reshuffle } from 'reshuffle-base-connector'
interface SPTicket {
  title: string
  requestedBy: string
  location?: string
  priority?: number
  severity?: string
  impact?: string
  actualHours: string
  resolutionComments?: string
  glCode?: string
  department: string
  private: boolean
  requestType: string
  description: string
  desiredCompletionDate: Date
  relatedAsset?: string
  businessManagerUser: string
  requestSource?: string
  resolvedOnInitialCall?: string
  attachments?: string
  tenantID: string
  comments: string
}

type Options = Record<string, any>

export class ServiceprimeConnector extends BaseConnector {
  constructor(app: Reshuffle, private readonly options: Options = {}, id?: string) {
    super(app, options, id)
    // a016b76...
    if (typeof options.bearerToken !== 'string' || options.bearerToken.length === 0) {
      throw new Error('Invalid bearerToken in options')
    }
    // localhost:44300 or Base Url
    if (typeof options.server !== 'string' || options.server.length === 0) {
      throw new Error('Invalid BaseUrl in options')
    }
  }

  private async request(method: 'GET' | 'POST', path: string, body?: string) {
    const res = await fetch(`https://${this.options.server}/API/${path}`, {
      method,
      headers: {
        'Authorization': `bearer ${this.options.bearerToken}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body } : {}),
    })

    if (res.status !== 200) {
      throw new Error(`Serviceprime API error ${res.status}`)
    }

    const reply = await res.json()
    return reply
  }

  // Actions ////////////////////////////////////////////////////////
  public async getTicket(ticketId: string) {
    if (!/^TSR\-\d{2}\-\d{6}$/.test(ticketId)) {
      throw new Error(`Invalid ticker ID: ${ticketId}`)
    }
    const res = await this.request('GET',`module/Record/${ticketId}`)
    if (!res) {
      throw new Error('Unnown ServicePrime error')
    }
    if (res.Status !== true) {
      throw new Error(`ServicePrime Error: ${res.ErrorMessage || 'Unknown'}`)
    }
    return res.Data
  }
  public async getOpenTickets(path: string) {
    const res = await this.request('GET',`module/Records/${path}`)
    if (!res) {
      throw new Error('Unnown ServicePrime error')
    }
    if (res.Status !== true) {
      throw new Error(`ServicePrime Error: ${res.ErrorMessage || 'Unknown'}`)
    }
    return res.Data
  }
}
