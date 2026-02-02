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

export type Worktime = {
  id: string
  type: string
  dept_device: string
  dept_name: string
  worker_last_name: string
  worker_name: string
  worker_second_name: string
  worker_job: string
  worker_worktime_like_unit: boolean
  worker_department_id: string
  timezone: string
  worktime: string
  all_week: boolean
  all_week_start: string
  all_week_end: string
  work_intervals_short: PeriodDay[]
  work_intervals_full: Workday[]
  dept_set_to_all: boolean
}

export type PeriodDay = {
  day_start: string
  day_end?: string
  work_start: string
  work_end: string
}

export type Workday = {
  day_num: string
  work_start: string
  work_end: string
  weekend: boolean
}

export type HoursRange = {
  start: string
  end: string
}

export type HoursRangeError = {
  id: string
  state: boolean
}
