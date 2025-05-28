import React from 'react'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import '../assets/App.css'

interface KsbToggleProps {
  toggleFunction: (ksb: string, index: number) => void
  criteria: Array<Array<string>>
  selected: Array<Array<number>>
}

function KsbToggle({ toggleFunction, criteria, selected }: KsbToggleProps): React.JSX.Element {
  return (
    <div id="criteriaToggleGrid">
      <div id="k_container" className="criteriaToggleRow">
        {criteria[0].map((k, index) => (
          <React.Fragment key={index}>
            <div
              id={'toggle_k_' + index}
              onClick={() => toggleFunction('k', index)}
              data-tooltip-id={'tooltip_k' + index}
              data-tooltip-delay-show={700}
              className="criteriaButton clickable"
              style={{ backgroundColor: selected[0].includes(index) ? '#64C8C8' : 'white' }}
            >
              K{index + 1}
            </div>
            <Tooltip id={'tooltip_k' + index}>{'K' + (index + 1) + ': ' + k}</Tooltip>
          </React.Fragment>
        ))}
      </div>

      <div id="s_container" className="criteriaToggleRow">
        {criteria[1].map((s, index) => (
          <React.Fragment key={index}>
            <div
              id={'toggle_s_' + index}
              onClick={() => toggleFunction('s', index)}
              data-tooltip-id={'tooltip_s' + index}
              data-tooltip-delay-show={700}
              className="criteriaButton clickable"
              style={{ backgroundColor: selected[1].includes(index) ? '#FFC68B' : 'white' }}
            >
              S{index + 1}
            </div>
            <Tooltip id={'tooltip_s' + index}>{'S' + (index + 1) + ': ' + s}</Tooltip>
          </React.Fragment>
        ))}
      </div>

      <div id="b_container" className="criteriaToggleRow">
        {criteria[2].map((b, index) => (
          <React.Fragment key={index}>
            <div
              id={'toggle_b_' + index}
              onClick={() => toggleFunction('b', index)}
              data-tooltip-id={'tooltip_b' + index}
              data-tooltip-delay-show={700}
              className="criteriaButton clickable"
              style={{ backgroundColor: selected[2].includes(index) ? '#B89AE9' : 'white' }}
            >
              B{index + 1}
            </div>
            <Tooltip id={'tooltip_b' + index}>{'B' + (index + 1) + ': ' + b}</Tooltip>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default KsbToggle
