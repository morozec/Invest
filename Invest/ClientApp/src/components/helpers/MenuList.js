import React, {Component} from 'react';
import { FixedSizeList as List } from "react-window";


const height = 35;
export class MenuList extends Component {
    render() {
      const { options, children, maxHeight, getValue } = this.props;
      const [value] = getValue();
      const initialOffset = options.indexOf(value) * height;
  
      // const optionsCount = options.length ? options.length : 1
      // const optionsHeight = optionsCount > 8
      //   ? maxHeight
      //   : optionsCount * height
  
      return (
        <List
          height={maxHeight}
          itemCount={children.length}
          itemSize={height}
          initialScrollOffset={initialOffset}
        >
          {({ index, style }) => <div style={style} className='searchListItem'>{children[index]}</div>}
        </List>
      );
    }
  }