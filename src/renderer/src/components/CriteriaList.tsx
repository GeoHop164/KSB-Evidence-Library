import '../assets/Help.css'
import '../assets/Builder.css'

type CriteriaListProps = {
  ksbs: Array<string>
  title: string
  iterator: () => void
}

function CriteriaList({ ksbs, title, iterator }: CriteriaListProps): React.JSX.Element {
  const colours = {
    Knowledge: '#64C8C8',
    Skills: '#FFC68B',
    Behaviours: '#B89AE9'
  }
  return (
    <div className="ksbContainer">
      <div className="CriteriaTitleDiv" style={{ backgroundColor: colours[title] }}>
        <h1 className="CriteriaTitle">{title}</h1>
        <button className='addKSB clickable' onClick={iterator}>+</button>
      </div>
      {ksbs.map((criteria, index) => (
        <div key={index} className="ksbListItem">
          {criteria}
        </div>
      ))}
    </div>
  )
}

export default CriteriaList
