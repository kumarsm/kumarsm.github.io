import { ReactComponent as Close } from '../data/Close.svg'
import { useState } from "react";
import Modal from 'react-modal'

Modal.setAppElement('#root')


export const ChallengeInputModal = ({ isOpen, handleClose, styles, darkMode, onSubmit, colorBlindMode, toggleColorBlindMode}) => {
 
  const [url, setUrl] = useState("<url>");

  const passValue = function (event){
    // TODO: validate URL
    onSubmit(url)
    event.preventDefault()
  }
  //const updateUrl = (event) => this.setState(url, event.target.value)

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={styles}
      contentLabel="Challenge Input Modal"
    >
      <div className={`h-full ${darkMode ? 'dark' : ''}`}>
        <div
          className={`h-full flex flex-col items-center justify-center max-w-[390px] mx-auto pt-9 text-primary dark:text-primary-dark `}
        >
          <h1 className="text-center mb-4 sm:text-3xl text-2xl">Challenge URL:</h1>
          <div className="flex-1 w-full border-b border-slate-400 mb-4">
            <button
              className="absolute top-4 right-4 rounded-full nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark p-1 w-6 h-6 sm:p-2 sm:h-8 sm:w-8"
              onClick={handleClose}
            >
              <Close />
            </button>
            <form onSubmit={passValue}>
                <div className="form-group flex items-center mt-8">
                    <input type="text" 
                    className="form-control rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark" 
                    id="challengeUrl" 
                    style={{width: "470px"}} 
                    value={url}
                    onChange={function (event){
                      setUrl(event.target.value)
                    }}
                    />
                </div> 
                <div className="form-group flex items-center mt-8">
                    <button 
                      className="form-control rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark" 
                      type="submit"
                    >
                        Submit
                    </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  )
}
