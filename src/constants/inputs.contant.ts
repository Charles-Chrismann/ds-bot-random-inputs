import { input } from "../../types"

const DIRECTION_LUCK = 4 * 4
const DIRECTION_RANGE_MAX = 4

const A_LUCK = 10
const B_LUCK = 10

const inputs = [
  {
    key: "RIGHT",
    luck: DIRECTION_LUCK,
    range: DIRECTION_RANGE_MAX
  },
  {
    key: "LEFT",
    luck: DIRECTION_LUCK,
    range: DIRECTION_RANGE_MAX
  },
  {
    key: "UP",
    luck: DIRECTION_LUCK,
    range: DIRECTION_RANGE_MAX
  },
  {
    key: "DOWN",
    luck: DIRECTION_LUCK,
    range: DIRECTION_RANGE_MAX
  },
  {
    key: "A",
    luck: A_LUCK,
    range: 1
  },
  {
    key: "B",
    luck: B_LUCK,
    range: 1
  },
  // "SELECT",
  // "START"
  // "L",
  // "R"
] as {key: input, luck: number, range: number}[]

export default inputs