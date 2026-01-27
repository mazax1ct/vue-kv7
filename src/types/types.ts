export type FilterColumn = {
  field: string
  header: string
  filter?: boolean
  options?: []
}

export type Mark = {
  id: string
  date: Date
  day: string
  name: string
  location: string
  position: string
  graphic: string
  in: string
  in_warning: boolean
  out: string
  out_warning: boolean
  fact: string
  fact_warning: boolean
  late: string
  defect: string
  late_out: string
  notify: string
}

export type Notice = {
  id: string
  timezone: string
  start: string
  end: string
}
