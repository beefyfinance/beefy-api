export type ConstInterface<type, i> = {
  readonly [key in keyof type]: type[key];
} &
  i;
export type ConstRecord<type, value> = {
  readonly [key in keyof type]: ConstInterface<type[key], value>;
};
