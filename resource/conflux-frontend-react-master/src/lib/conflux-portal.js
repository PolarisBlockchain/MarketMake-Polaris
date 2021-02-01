class ConfluxPortal {
  constructor (conflux) {
    if (typeof conflux === 'undefined') {
      throw new Error('No Conflux detected')
    }
    if (!conflux.isConfluxPortal) {
      console.debug('Unknown Conflux.')
    }
    this.conflux = conflux
  }

  async enable () {
    this.accounts = await this.conflux.enable()
  }

  getAccount () {
    if (!this.accounts) {
      throw new Error('Please enable Conflux Portal first')
    }
    return this.accounts[0]
  }

  async sendTransaction (params) {
    return new Promise((resolve, reject) => {
      this.conflux.sendAsync({
        method: 'cfx_sendTransaction',
        params: [params],
        from: params.from,
        // gasPrice: params.gasPrice, // customizable by user during ConfluxPortal confirmation.
        // gas: params.gas,  // customizable by user during ConfluxPortal confirmation.
        // value: params.value,
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

export default new ConfluxPortal(window.conflux)
