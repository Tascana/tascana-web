# Welcome to Tascana!

Tascana is a todo app helping you achieve big goals in a calm way.

The key idea of Tascana is to shift the mindset of short term tasks (most of the current todo apps) to long term goals. 

- Allow users to define yearly goals

- Allow users to define monthly goals connected to their yearly goals

- Allow users to define daily tasks connected to their monthly goals

- Split days in 3 parts: morning, afternoon, evening

### Test it live

Our stable deployment runs on https://tascana.com

WIP build runs on https://dev.tascana.com

### Contribute

Check current [Issues](https://github.com/Tascana/tascana-web/issues), [Project plans](https://github.com/Tascana/tascana-web/projects/1)

#### start

```sh
npm run start
```

#### build

```sh
npm run build
```

#### db task structure

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

#### redux task structure

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

#### Before pushing

- [ ] [Check if everything works](https://docs.google.com/spreadsheets/d/1dY_AM7NfbhIYaTQUI2X-cg3cDLvQlS-iNJovOwJDLoI/edit#gid=0)

## License

https://tldrlegal.com/license/simple-non-code-license-(sncl)#fulltext
