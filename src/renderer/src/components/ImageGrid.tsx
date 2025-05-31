import { useEffect, useState } from 'react'
import '../assets/ImageGrid.css'
import '../assets/Cards.css'
// import loadingIcon from '../assets/loading.svg'

interface ImageGridProps {
  criteria: Array<Array<number>>
  setLoading: (load: boolean) => void
  imageClicked: (id: string) => void
  loading: boolean
  refreshKey: number
}

interface ImageMap {
  [key: string]: string
}

function ImageGrid({
  criteria,
  loading,
  setLoading,
  imageClicked,
  refreshKey
}: ImageGridProps): React.JSX.Element {
  const [allImages, setAllImages] = useState<
    Record<
      string,
      { base64: string; criteria: { knowledge: number[]; skill: number[]; behaviour: number[] } }
    >
  >({})
  const [filteredImages, setFilteredImages] = useState<ImageMap>({})
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchImages = async (): Promise<void> => {
      try {
        const result = await window.electron.ipcRenderer.invoke('getImages')
        setAllImages(result)
      } catch (error) {
        console.error('Failed to fetch images:', error)
      } finally {
        // setLoading(false)
        // setInitialLoad(false)
      }
    }

    fetchImages()
  }, [setLoading, refreshKey])

  useEffect(() => {
    const [k, s, b] = criteria
    const filtered: ImageMap = {}

    for (const [id, { base64, criteria }] of Object.entries(allImages)) {
      const { knowledge = [], skill = [], behaviour = [] } = criteria
      const matches =
        k.every((val) => knowledge.includes(val)) &&
        s.every((val) => skill.includes(val)) &&
        b.every((val) => behaviour.includes(val))

      if (matches) {
        filtered[id] = base64
      }
    }

    const preloadImages = async (): Promise<void> => {
      const loadPromises = Object.values(filtered).map((src) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = resolve
        })
      })

      await Promise.all(loadPromises)
      setFilteredImages(filtered)
      setLoading(false)
      setInitialLoad(false)
    }

    if (Object.keys(filtered).length > 0) {
      preloadImages()
    } else {
      setFilteredImages(filtered)
      setInitialLoad(false)
    }
  }, [criteria, allImages, setLoading])

  function imageClickHandler(id: string): void {
    imageClicked(id)
  }

  return (
    <div id="imageGridContainer">
      {loading || initialLoad ? (
        <div
          className="card"
          style={{
            backgroundColor: 'white',
            marginTop: '10%',
            display: 'block',
            marginRight: 'auto',
            marginLeft: 'auto',
            width: 'fit-content'
          }}
        >
          <h1 style={{ color: 'black' }}>Loading...</h1>
        </div>
      ) : (
        <div id="imageGrid">
          {Object.entries(filteredImages).map(([key, base64]) => (
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
      )}
    </div>
  )
}

export default ImageGrid
