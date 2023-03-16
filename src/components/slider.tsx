import React, { memo, useRef, useState } from 'react';
import { StyleSheet, Dimensions, TouchableHighlight, TouchableWithoutFeedback, Platform, Linking } from 'react-native';
import { View } from 'native-base';
import FastImage from 'react-native-fast-image';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { ISliderPicture } from '@app-interfaces/home.interface';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, AuthStackParamList } from 'navigation/navigation';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AppStackParamList, 'Product'>,
    StackNavigationProp<AuthStackParamList, 'Register'>>;
    
interface IProps {
    sliderPictures: ISliderPicture[]
};

const screenWidth = Dimensions.get('window').width;
const itemWidth = Math.round(screenWidth * 0.85);
const sliderHeight = 1080 / (1920 / itemWidth);

const Slider: React.FC<IProps> = (props) => {

    const navigation = useNavigation<ScreenNavigationProp>();

    const { sliderPictures } = props;
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const carouselRef: any = useRef(null)

    const renderItem = (item: { item: ISliderPicture; index: number; }, parallaxProps?: any | undefined) => {
        return (
            <TouchableHighlight
                style={[(Platform.OS === 'ios' ? componentStyles.iosShadow : componentStyles.androidShadow), { borderRadius: 10, height: sliderHeight }]}
                key={item.index}
                disabled={item.item.actionTypeId == 0}
                underlayColor='transparent'
                onPress={() => { console.log(item.item); doSliderAction(item.item.actionTypeId, item.item.additionalData); }}
            >
                <FastImage
                    style={{
                        width: itemWidth,
                        height: sliderHeight,
                        borderRadius: 10,
                        alignSelf: 'center'
                    }}
                    source={{ uri: item.item.sliderPictureUrl }}
                    resizeMode='stretch'
                />
            </TouchableHighlight>
        );
    };

    const onSnap = (index: number) => {
        setCurrentImageIndex(index);
    };

    const getPagination = () => (
        <Pagination
            dotsLength={sliderPictures.length}
            activeDotIndex={currentImageIndex}
            dotStyle={componentStyles.sliderDot}
            dotColor={customVariables.brandPrimary}
            inactiveDotColor='#FFFFFF'
            inactiveDotScale={0.8}
            inactiveDotOpacity={0.8}
            containerStyle={componentStyles.paginationBoxStyle}
        />
    );

    const doSliderAction = (type: number, data: any) => {
        console.log(type + ' - ' + data)
        if (type > 0) {
            switch (type) {
                case 20: // Open shopping cart
                    navigation.push("ShoppingCart");
                    break;
                case 30: // Open wishlist
                    navigation.push("Wishlist");
                    break;
                case 40: // Open register
                    navigation.push("Register");
                    break;
                default:
                    break;
            }
            if (data) {
                switch (type) {
                    case 50: // Open category
                        navigation.push("Category", {
                            categoryId: data?.id,
                            categoryName: data?.name,
                            isChild: data?.isChild,
                        });
                        break;
                    case 60: // Open product
                        navigation.push("Product", {
                            productId: data?.id,
                            shouldLoadProduct: true,
                        });
                        break;
                    case 70: // Open and search term
                        navigation.push("Search", {
                            givenSearchTerm: data?.keyword
                        });
                        break;
                    case 80: // Open external link
                        // <WebView
                        //     // style={{ width: 0, height: 0, position: 'absolute', top: -5000 }}
                        //     source={{ uri: data?.Link }}
                        // />
                        Linking.openURL(data?.link);
                        break;
                    default:
                        break;
                }
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{height: sliderHeight + 20}}>
                <Carousel
                    data={sliderPictures}
                    loop={true}
                    enableSnap={true}
                    autoplay={true}
                    autoplayInterval={7000}
                    itemWidth={itemWidth}
                    sliderWidth={screenWidth}
                    loopClonesPerSide={5}
                    renderItem={renderItem}
                    onSnapToItem={onSnap}
                    ref={carouselRef}
                    inactiveSlideShift={0}
                    containerCustomStyle={componentStyles.carouselContainer}
                    useScrollView={true}
                />
                {sliderPictures.length > 1 && getPagination()}
            </View>
        </View>
    )
};

const componentStyles = StyleSheet.create({
    sliderDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 0,
        padding: 0,
        margin: 0,
        backgroundColor: "rgba(128, 128, 128, 0.92)"
    },
    paginationBoxStyle: {
        position: "absolute",
        bottom: 0,
        padding: 0,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        paddingVertical: 20
    },
    arrowRigth: {
        zIndex: 1,
        opacity: .7,
        position: 'absolute',
        alignSelf: 'flex-end',
        marginTop: sliderHeight / 2.5
    },
    arrowLeft: {
        zIndex: 1,
        opacity: .7,
        position: 'absolute',
        marginTop: sliderHeight / 2.5
    },
    carouselContainer: {
        marginTop: 10
    },
    androidShadow: {
        elevation: 5
    },
    iosShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    }
});

export default memo(Slider);