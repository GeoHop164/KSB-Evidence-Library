import '../assets/Help.css'
import '../assets/Builder.css'
import { useEffect } from 'react'

type CriteriaListProps = {
  ksbs: Array<string>
  title: string
  // iterator: (Array) => void
  iterator: (updatedKsbs: string[]) => void
}

function CriteriaList({ ksbs, title, iterator }: CriteriaListProps): React.JSX.Element {
  const colours = {
    Knowledge: '#64C8C8',
    Skills: '#FFC68B',
    Behaviours: '#B89AE9'
  }
  function handleClick(): void {
    iterator([...ksbs, ''])
  }
  function removeCriteria(index: number): void {
    const updatedKsbs = ksbs.filter((_, i) => i !== index)
    iterator(updatedKsbs)
  }

  useEffect(() => {
    const textareas = document.querySelectorAll(`.inputCriteria`)
    textareas.forEach((textarea) => {
      const el = textarea as HTMLTextAreaElement
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    })
  }, [ksbs])

  return (
    <div className="ksbContainer">
      <div className="CriteriaTitleDiv" style={{ backgroundColor: colours[title] }}>
        <h1 className="CriteriaTitle">{title}</h1>
        <button className="addKSB clickable" onClick={handleClick}>
          +
        </button>
      </div>
      <div className="ksbListContainer">
        {ksbs.map((criteria, index) => (
          <div key={index} className="ksbListItem">
            <div className="criteriaNumber">{index + 1}: </div>
            <textarea
              className="inputCriteria"
              id={'criteriaInput_' + title + '_' + index}
              placeholder="[Enter Criteria]"
              rows={1}
              value={criteria}
              style={{ resize: 'none', overflow: 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            ></textarea>
            {index == ksbs.length - 1 && (
              <div
                className="removeCriteria"
                id={'remove_' + index}
                onClick={() => {
                  removeCriteria(index)
                }}
              >
                -
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CriteriaList
