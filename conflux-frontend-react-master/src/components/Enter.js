import React, { PureComponent } from 'react'
import lodash from 'lodash'
import confluxPortal from '../lib/conflux-portal'

class ConfluxForm extends PureComponent {
  onSubmit = async event => {
    event.preventDefault()
    const form = document.querySelector(`#form-${this.props.method.name}`)
    const params = []
    for (let element of form.elements) {
      if (element.type !== 'submit') {
        params.push(element.value)
      }
    }
    this.props.onSubmit(params)
  }

  render () {
    const { method } = this.props

    let formInputs
    if (!method.inputs || !method.inputs.length) {
      formInputs = <p className="text-muted">(No inputs)</p>  
    } else {
      formInputs = method.inputs.map(field => {
        let label = field.name
        if (!label) {
          label = <span className="text-muted">(No name)</span>
        }
        return (
          <div key={`input-field-${field.name}`} className="form-group">
            <label htmlFor={`form-${method.name}-${field.name}`}>{label}</label>
            <input
              id={`form-${method.name}-${field.name}`}
              name={field.name}
              className="form-control"
              placeholder={`Type: ${field.type}`}
            />
          </div>
        )
      })
    }

    return (
      <form id={`form-${method.name}`} className="mt-3" onSubmit={this.onSubmit}>
        {formInputs}
        <button type="submit" className="btn btn-primary">
          { method.stateMutability === 'view' ? 'Query Data' : 'Push Transaction' }
        </button>
      </form>
    )
  }
}

class ContractMethods extends PureComponent {
  state = {
    selected: ''
  }

  onSelect = selected => {
    this.setState({ selected })
    this.props.onChangeMethod(selected)
  }

  renderSelected = selected => {
    if (!selected) {
      return null
    }
    if (selected.type === 'function') {
      return (
        <ConfluxForm
          method={selected}
          onSubmit={params => this.props.onSubmit(selected, params)}
        />
      )
    }
    if (selected.type === 'event') {
      return (
        <button
          className="btn btn-primary mt-3"
          onClick={() => this.props.onSubmit(selected)}
        >
          Query Event Logs
        </button>
      )
    }
  }

  render () {
    const { abiTable } = this.props

    if (!abiTable || (!abiTable.function && !abiTable.event)) {
      return null
    }

    const selectedName = this.state.selected?.name
    let buttonText = 'Select method or event'
    if (selectedName) {
      if (this.state.selected.type === 'function') {
        buttonText = <span>Method <b>{selectedName}</b></span>
      } else if (this.state.selected.type === 'event') {
        buttonText = <span>Event <b>{selectedName}</b></span>
      }
    }

    return (
      <React.Fragment>
        <div >
        
          <div>
            
            <h6 className="dropdown-header">READ</h6>
            {abiTable.function && abiTable.function.filter(method => method.stateMutability === 'view').map(method => (
              
                <button
                    key={`function-${method.name}`}
                    onClick={() => this.onSelect(method)}
                    className="btn btn-primary mt-3"
                    style={{margin: 15}}
                >
                    {method.name}
                </button>

            ))}

            <div className="dropdown-divider"></div>
            <h6 className="dropdown-header">WRITE</h6>
            {abiTable.function && abiTable.function.filter(method => method.stateMutability !== 'view').map(method => (
              <button
                key={`function-${method.name}`}
                onClick={() => this.onSelect(method)}
                className="btn btn-primary mt-3"
                style={{margin: 15}}
              >
                {method.name}
              </button>
            ))}


            <div className="dropdown-divider"></div>
            <h6 className="dropdown-header">EVENT</h6>
            {abiTable.event && abiTable.event.map(event => (
              <button
                key={`event-${event.name}`}
                onClick={() => this.onSelect(event)}
                className="btn btn-primary mt-3"
                style={{margin: 15}}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
        {this.renderSelected(this.state.selected)}
      </React.Fragment>
    )
  }
}

export default class Buttons extends PureComponent {
  state = {
    loading: false,
    result: '',
    error: '',
  }

  onSubmit = async (selected, params) => {
    
    if (selected.type === 'event') {
      // query events
      this.setState({ loading: true })
      try {
        const result = await this.props.contract[selected.name].call(...Array(selected.inputs.length)).getLogs()
        this.setState({
          loading: false, result:
          JSON.stringify(result.map(x => ({ epoch: x.epochNumber, ...x.params.object })), null, 2),
          error: ''
        })
      } catch (err) {
        this.setState({ loading: false, result: '', error: err.message })
        return
      }
    } else if (selected.stateMutability === 'view') {
      // read data
      this.setState({ loading: true })
      try {
        const result = await this.props.contract[selected.name].call(...params)
        this.setState({ loading: false, result: result.toString(), error: '' })
      } catch (err) {
        this.setState({ loading: false, result: '', error: err.message })
        return
      }
    } else {
      // write
      this.setState({ loading: true })
      try {
        const called = this.props.contract[selected.name].call(...params)
        console.log(called);
        const result = await confluxPortal.sendTransaction({
          from: confluxPortal.getAccount(),
          to: called.to,
          data: called.data, 
          value: '0x8AC7230489E80000', // 10CFX
          gasPrice: '0x64', // 100 drips
          gas: '0xF4240',  // 1,000,000 drips
          storageLimit: '0x400', //1240
        })
        this.setState({ loading: false, result: `Transaction pushed with hash: ${result.result}`, error: '' })
      } catch (err) {
        this.setState({ loading: false, result: '', error: err.message })
        return
      }
    }
  }

  renderResult = () => {
    if (this.state.loading) {
      return (
        <div className="card-footer">
          Loading...
        </div>
      ) 
    } if (this.state.result) {
      return (
        <div className="card-footer">
          <pre className="overflow-hidden mb-0" style={{
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
          }}>{this.state.result}</pre>
        </div>
      )
    } else if (this.state.error) {
      return (
        <div className="card-footer text-danger">
          {this.state.error}
        </div>
      )
    } else {
      return null
    }
  }

  render () {
    const { name, abi, contract } = this.props

    const abiTable = lodash.groupBy(abi, 'type')

    return (
      <div className="card">
        <div className="card-body">
          <ContractMethods
            abiTable={abiTable}
            onSubmit={this.onSubmit}
            onChangeMethod={() => this.setState({ loading: false, result: '', error: '' })}
          />
        </div>
        {this.renderResult()}
      </div>
    )
  }
}
