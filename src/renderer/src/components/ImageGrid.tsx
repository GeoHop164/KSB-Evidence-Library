import { useEffect, useState } from 'react'
import '../assets/ImageGrid.css'
import '../assets/Cards.css'
// import loadingIcon from '../assets/loading.svg'

interface ImageGridProps {
  criteria: Array<Array<number>>
  setLoading: (load: boolean) => void
  imageClicked: (id: string) => void
  loading: boolean
}

interface ImageMap {
  [key: string]: string
}

function ImageGrid({
  criteria,
  loading,
  setLoading,
  imageClicked
}: ImageGridProps): React.JSX.Element {
  const [images, setImages] = useState<ImageMap>({})

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      try {
        const result: ImageMap = await window.electron.ipcRenderer.invoke('getImages', criteria)
        setImages(result)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch images:', error)
      }
    }

    fetchImages()
  }, [criteria, setLoading])

  function imageClickHandler(id: string): void {
    imageClicked(id)
  }

  return (
    <>
      {!loading ? (
        <div id="imageGrid">
          {Object.entries(images).map(([key, base64]) => (
            <div
              id={'container_' + key}
              key={key}
              className="evidenceImageContainer"
              onClick={() => {
                imageClickHandler(key)
              }}
            >
              <img
                src={base64}
                alt={`Image ${key}`}
                className="evidenceImage"
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      ) : (
        // <img src={loadingIcon}></img>
        <div className="card" style={{ backgroundColor: 'white' }}>
          <h1 style={{ color: 'black' }}>Loading...</h1>
        </div>
      )}
    </>
  )
}

export default ImageGrid
