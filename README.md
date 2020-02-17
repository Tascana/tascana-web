# Tascana web app

start

```sh
npm run start
```

build

```sh
npm run build
```

db task structure

```
{
  id: "0000000000",
  background: "linear-gradient(to bottom, #e2e2e2, #bbb)",
  progress: 0,
  parents: "0000000000,0000000001,0000000002",
  children: "0000000003,0000000004",
  position: 0,
  type: "DAY"|"MONTH"|"YEAR"
  subtype?: "MORNING"|"AFTERNOON"|"EVENING",
  text: "Just do it!",
  createdAt: 1581844989771,
  updatedAt?: 1581844989771,
  userId:"GhJmgbU5qpc0LZsoRzps1SHFJiG3" 
}
```

redux task structure

```
{
  id: "0000000000",
  background: "linear-gradient(to bottom, #e2e2e2, #bbb)",
  progress: 0,
  parents: [{ id: "0000000001", ... }, ...],
  children: [{ id: "0000000001", ... }, ...],
  position: 0,
  type: "DAY"|"MONTH"|"YEAR"
  subtype?: "MORNING"|"AFTERNOON"|"EVENING",
  text: "Just do it!",
  year: 2020,
  month?: 2,
  day?: 20,
  userId:"GhJmgbU5qpc0LZsoRzps1SHFJiG3" 
}
```
