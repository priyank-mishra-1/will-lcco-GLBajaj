import { useReducer } from "react"

const CountButton = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)

  const handleClick = () => {
    increase()
    console.log(count)
  }

  return (
    <button
      onClick={() => handleClick()}
      type="button"
      className="flex flex-row items-center px-4 py-2 text-sm rounded-lg transition-all border-none
      shadow-lg hover:shadow-md
      active:scale-105">
      Count:
      <span className="inline-flex items-center justify-center w-8 h-4 ml-2 text-xs font-semibold rounded-full">
        {count}
      </span>
    </button>
  )
}

export default CountButton
