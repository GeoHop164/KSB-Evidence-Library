import React from 'react'
import Logo from '../assets/Logo.png'

interface HeaderProps {
  main: boolean
}

function Header({ main = false }: HeaderProps): React.JSX.Element {
  return (
    <div
      id="header"
      style={{
        backgroundColor: 'white',
        border: 'solid black 1vh',
        boxSizing: 'border-box',
        display: 'flex',
        marginTop: '1%',
        height: main ? '10vh' : '15vh',
        width: '25%',
        boxShadow: '-1vh 1vh 0px 0px rgba(0, 0, 0, 1)',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        left: main ? '0' : 'auto'
      }}
    >
      <img src={Logo} style={{ height: '50%', marginRight: '10%' }}></img>
      <h1 style={{ color: 'black' }}>KSB Library</h1>
    </div>
  )
}

export default Header
