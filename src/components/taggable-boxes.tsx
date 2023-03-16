import React, { memo } from 'react';
import {Dimensions, Image, StyleSheet} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Carousel from 'react-native-snap-carousel';
import {ITaggableBox} from '@app-interfaces/home.interface';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from 'navigation/navigation';
import {TouchableOpacity, TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Button, Text, View} from 'native-base';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList>;

interface IProps {
    boxes: ITaggableBox[];
    containerStyle?: any;
}

const screenWidth = Dimensions.get('window').width;
const itemWidth = Math.round(screenWidth * 0.4);
const sliderHeight = 600 / (400 / itemWidth);

const TaggableBoxes: React.FC<IProps> = (props) => {
    const {boxes, containerStyle} = props;
    const navigation = useNavigation<ScreenNavigationProp>();

    const handleBoxPress = (taggableBox: ITaggableBox) => {
        switch (taggableBox.type) {
            case 0:
                navigation.push('Tag', {
                    tagId: taggableBox.elementId,
                    tagName: taggableBox.elementName,
                });
                break;
            case 1:
                navigation.push('Product', {
                    productId: taggableBox.elementId,
                    shouldLoadProduct: true,
                });
                break;
            case 2:
                navigation.push('Category', {
                    categoryName: taggableBox.elementName,
                    categoryId: taggableBox.elementId,
                    isChild: taggableBox.isChild,
                });
                break;
            default:
                break;
        }
    };

    const renderItem = (item: {item: string; index: number}, parallaxProps?: any | undefined) => {
        let currentIndex = boxes
            .map((x) =>
                x.pictureUrl.replace('https://localhost:44387', 'http://192.168.0.124:8045'),
            )
            .indexOf(item.item);
        return (
            <TouchableWithoutFeedback onPress={() => handleBoxPress(boxes[currentIndex])}>
                <FastImage
                    style={{
                        width: itemWidth,
                        height: sliderHeight,
                        borderRadius: 10,
                    }}
                    source={{uri: item.item}}
                />
            </TouchableWithoutFeedback>
        );
    };

    return (
        <Carousel
            data={boxes.map((x) =>
                x.pictureUrl.replace('https://localhost:44387', 'http://192.168.0.124:8045'),
            )}
            loop={true}
            autoplay={true}
            itemWidth={itemWidth}
            sliderWidth={screenWidth}
            renderItem={renderItem}
            inactiveSlideShift={0}
            autoplayInterval={7000}
            containerCustomStyle={[componentStyles.carouselContainer, containerStyle]}
            useScrollView={true}
        />
    );
};

const componentStyles = StyleSheet.create({
    androidShadow: {
        elevation: 5,
    },
    iosShadow: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    carouselContainer: {
        marginTop: 10,
        marginBottom: 30,
    },
});

export default memo(TaggableBoxes);
