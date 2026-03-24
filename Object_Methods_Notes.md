# JavaScript Object Methods: `.entries()`, `.fromEntries()`, and `.filter()`

This is a breakdown of how to remove key-value pairs from an object (for example, removing any keys that have a value of `null`).

### The Code Example
```javascript
const cleanProfileData = Object.fromEntries(
    Object.entries(profileData).filter(([_, value]) => value !== null)
);
```

### 1. `Object.entries(profileData)`
This built-in method takes an object and turns it into an **array of arrays**, where each inner array is a `[key, value]` pair.

**Example:**
If `profileData` looks like this:
```javascript
{
  age: 25,
  gender: "Male",
  disabilityType: null
}
```
`Object.entries(profileData)` changes it into this:
```javascript
[
  ["age", 25],
  ["gender", "Male"],
  ["disabilityType", null]
]
```

### 2. `.filter(([_, value]) => value !== null)`
Now that we have an array of arrays, we can use the `.filter()` method to remove the items we don't want. 

`.filter()` loops over every item in the array. If the function inside it returns `true`, the item is kept. If it returns `false`, the item is removed.

### 3. `[_, value]` inside the filter parameter
When `.filter()` loops through our array of arrays, it passes each inner array (like `["age", 25]`) into our function. 

We use array destructuring `[key, value]` to grab the two elements out of that inner array:
- The first item is the key (like `"age"` or `"disabilityType"`).
- The second item is the value (like `25` or `null`).

We write `[_, value]` instead of `[key, value]` purely as a naming convention. In JavaScript, an underscore (`_`) is often used to tell other developers: *"I know there is a variable here (the key), but I am not going to use it in my logic."*

So the logic `([_, value]) => value !== null` means:
*"Give me the key and the value, ignore the key, and only keep this pair if the value is **not** strictly equal to `null`."*

After the filter runs, our array looks like this (the `null` pair is gone!):
```javascript
[
  ["age", 25],
  ["gender", "Male"]
]
```

### 4. `Object.fromEntries(...)`
Finally, we have an array of the exact key-value pairs we want, but we need a regular object. 

`Object.fromEntries()` does the exact opposite of `Object.entries()`. It takes our filtered array of arrays and converts it back into an object.

**Final Result:**
```javascript
{
  age: 25,
  gender: "Male"
}
```
