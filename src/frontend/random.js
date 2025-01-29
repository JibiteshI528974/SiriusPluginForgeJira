if(currpage === 'list'){
    content = (
      <Fragment>
        <Text>All Entries</Text>
        <Button onPress={goToEntry}>Add New Entry</Button>
      </Fragment>
    )
  }else if(currpage === 'entry'){
    content = (
      <Fragment>
        <Label labelFor='release'>Enter Release Name : </Label>
        <Textfield id='release'></Textfield>
        <Label labelFor='name'>Enter Team-Member Name : </Label>
        <Textfield id='name'></Textfield>
        <Label labelFor='inumber'>Enter I-Number : </Label>
        <Textfield id='inumber'></Textfield>
        <Button onPress={goToList}>Add</Button>
    </Fragment>
    )
    
  }